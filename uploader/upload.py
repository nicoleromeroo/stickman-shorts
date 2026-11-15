"""Uploads queued Shorts (GitHub Releases tagged 'video-*') to YouTube.

Runs inside GitHub Actions. Each queued release holds two assets:
  video.mp4   the finished Short
  meta.json   {"title", "description", "tags", "publish_at" (ISO 8601 with offset), "category_id"}

Review phase: the first REVIEW_COUNT uploads go up as PRIVATE without a publish time,
so the owner can watch them in YouTube Studio and publish by hand.
After that, uploads are PRIVATE with publishAt = scheduled time (YouTube publishes automatically).

Secrets (GitHub repo settings -> Secrets and variables -> Actions):
  YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN
"""
import json, os, sys, datetime, tempfile
import requests
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

REPO = os.environ["GITHUB_REPOSITORY"]
GH = os.environ["GITHUB_TOKEN"]
REVIEW_COUNT = int(os.environ.get("REVIEW_COUNT", "10"))
STATE = os.path.join(os.path.dirname(__file__), "..", "state.json")


def gh(method, path, accept="application/vnd.github+json", raw=False):
    url = f"https://api.github.com{path}" if path.startswith("/") else path
    r = requests.request(method, url, headers={"Authorization": f"Bearer {GH}", "Accept": accept,
                                               "X-GitHub-Api-Version": "2022-11-28"}, timeout=300)
    r.raise_for_status()
    if raw:
        return r.content
    return r.json() if r.content else None


def load_state():
    try:
        return json.load(open(STATE))
    except FileNotFoundError:
        return {"uploaded_count": 0, "uploads": []}


def youtube():
    creds = Credentials(None, refresh_token=os.environ["YT_REFRESH_TOKEN"], token_uri="https://oauth2.googleapis.com/token",
                        client_id=os.environ["YT_CLIENT_ID"], client_secret=os.environ["YT_CLIENT_SECRET"],
                        scopes=["https://www.googleapis.com/auth/youtube.upload"])
    return build("youtube", "v3", credentials=creds, cache_discovery=False)


def main():
    state = load_state()
    releases = [r for r in gh("GET", f"/repos/{REPO}/releases?per_page=50") if r["tag_name"].startswith("video-")]
    releases.sort(key=lambda r: r["tag_name"])
    if not releases:
        print("queue empty"); return
    yt = youtube(); now = datetime.datetime.now(datetime.timezone.utc)
    for rel in releases:
        assets = {a["name"]: a for a in rel["assets"]}
        if "video.mp4" not in assets or "meta.json" not in assets:
            print("skip incomplete", rel["tag_name"]); continue
        meta = json.loads(gh("GET", assets["meta.json"]["url"], accept="application/octet-stream", raw=True))
        tmp = tempfile.mkdtemp(); vid = os.path.join(tmp, "video.mp4")
        open(vid, "wb").write(gh("GET", assets["video.mp4"]["url"], accept="application/octet-stream", raw=True))
        review = state["uploaded_count"] < REVIEW_COUNT
        status = {"privacyStatus": "private", "selfDeclaredMadeForKids": bool(meta.get("made_for_kids", False)),
                  "containsSyntheticMedia": False}
        pub = meta.get("publish_at")
        if not review and pub:
            when = datetime.datetime.fromisoformat(pub)
            if when > now + datetime.timedelta(minutes=15):
                status["publishAt"] = when.astimezone(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
            else:
                status = {**status, "privacyStatus": "public"}
        body = {"snippet": {"title": meta["title"][:100], "description": meta["description"][:4900],
                            "tags": meta.get("tags", [])[:15], "categoryId": str(meta.get("category_id", "27")),
                            "defaultLanguage": "en", "defaultAudioLanguage": "en"},
                "status": status}
        req = yt.videos().insert(part="snippet,status", body=body, media_body=MediaFileUpload(vid, mimetype="video/mp4", resumable=True, chunksize=8 * 1024 * 1024))
        resp = None
        while resp is None:
            _, resp = req.next_chunk()
        vid_id = resp["id"]
        mode = "REVIEW (private)" if review else ("scheduled " + status.get("publishAt", "") if "publishAt" in status else status["privacyStatus"])
        print(f"uploaded {rel['tag_name']} -> https://youtu.be/{vid_id} [{mode}]")
        state["uploaded_count"] += 1
        state["uploads"].append({"tag": rel["tag_name"], "video_id": vid_id, "title": meta["title"], "mode": mode,
                                 "uploaded_at": now.isoformat(timespec="seconds")})
        # remove the release + tag so the repo stays small
        gh("DELETE", f"/repos/{REPO}/releases/{rel['id']}")
        try:
            gh("DELETE", f"/repos/{REPO}/git/refs/tags/{rel['tag_name']}")
        except Exception as e:
            print("tag delete failed", e)
        json.dump(state, open(STATE, "w"), indent=1)


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print("ERROR:", e); sys.exit(1)
