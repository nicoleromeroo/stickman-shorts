"""Uploads queued Shorts to YouTube. Runs inside GitHub Actions.

Queue = the `queue` branch, checked out at $QUEUE_DIR. Each video is a folder:
  <tag>/video.mp4   the finished Short           (tag = video-YYYYMMDD-slotN)
  <tag>/meta.json   {"title", "description", "tags", "publish_at", "category_id", "made_for_kids"}

Review phase: the first REVIEW_COUNT uploads go up PRIVATE without a publish time, so the owner
can check them in YouTube Studio and publish by hand. After that: PRIVATE + publishAt (YouTube
publishes automatically at that time), or PUBLIC if the time has already passed.

Secrets: YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN
"""
import json, os, sys, shutil, datetime
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

QUEUE = os.environ.get("QUEUE_DIR", "q")
REVIEW_COUNT = int(os.environ.get("REVIEW_COUNT", "10"))
STATE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "state.json")


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
    done = {u["tag"] for u in state["uploads"]}
    items = sorted(d for d in os.listdir(QUEUE) if d.startswith("video-") and os.path.isdir(os.path.join(QUEUE, d))) if os.path.isdir(QUEUE) else []
    if not items:
        # still prove the YouTube connection works, so an expired token shows up as a failed run
        from google.auth.transport.requests import Request
        c = youtube()._http.credentials
        c.refresh(Request())
        print("queue empty; YouTube token OK"); return
    yt = None; now = datetime.datetime.now(datetime.timezone.utc)
    for tag in items:
        d = os.path.join(QUEUE, tag); vid = os.path.join(d, "video.mp4"); mp = os.path.join(d, "meta.json")
        if tag in done:
            print("already uploaded, removing", tag); shutil.rmtree(d); continue
        if not (os.path.isfile(vid) and os.path.isfile(mp)):
            print("skip incomplete", tag); continue
        meta = json.load(open(mp, encoding="utf-8"))
        review = state["uploaded_count"] < REVIEW_COUNT
        status = {"privacyStatus": "private", "selfDeclaredMadeForKids": bool(meta.get("made_for_kids", False)),
                  "containsSyntheticMedia": False}
        pub = meta.get("publish_at")
        if not review and pub:
            when = datetime.datetime.fromisoformat(pub)
            if when > now + datetime.timedelta(minutes=15):
                status["publishAt"] = when.astimezone(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
            else:
                status["privacyStatus"] = "public"
        body = {"snippet": {"title": meta["title"][:100], "description": meta["description"][:4900],
                            "tags": meta.get("tags", [])[:15], "categoryId": str(meta.get("category_id", "27")),
                            "defaultLanguage": "en", "defaultAudioLanguage": "en"},
                "status": status}
        yt = yt or youtube()
        req = yt.videos().insert(part="snippet,status", body=body,
                                 media_body=MediaFileUpload(vid, mimetype="video/mp4", resumable=True, chunksize=8 * 1024 * 1024))
        resp = None
        while resp is None:
            _, resp = req.next_chunk()
        vid_id = resp["id"]
        mode = "REVIEW (private)" if review else ("scheduled " + status["publishAt"] if "publishAt" in status else status["privacyStatus"])
        print(f"uploaded {tag} -> https://youtu.be/{vid_id} [{mode}]")
        state["uploaded_count"] += 1
        state["uploads"].append({"tag": tag, "video_id": vid_id, "title": meta["title"], "mode": mode,
                                 "publish_at": pub, "uploaded_at": now.isoformat(timespec="seconds")})
        json.dump(state, open(STATE, "w"), indent=1)   # save after every upload
        shutil.rmtree(d)


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print("ERROR:", e); sys.exit(1)
