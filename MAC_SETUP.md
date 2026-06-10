# BeOne Comps Launcher - Mac Setup

This folder contains the local prototype for the BeOne oncology comps launcher.

## What You Need

- macOS
- Python 3.10 or newer
- An OpenAI API key

The app uses only Python standard-library modules, so you should not need to install Python packages for the current prototype.

## Start The App

Open Terminal, go to this folder, and run:

```bash
export OPENAI_API_KEY="your_api_key_here"
./start_comps_launcher_mac.sh
```

Then open:

```text
http://127.0.0.1:4174/index.html
```

## Notes

- Do not put your API key into the website UI.
- Uploaded `.csv` and `.xlsx` files are treated as candidate leads requiring verification.
- The backend bypasses proxy environment variables by default for OpenAI calls. If your Mac needs a corporate proxy, start with:

```bash
export OPENAI_DISABLE_PROXY=0
./start_comps_launcher_mac.sh
```

## Current Backend Settings

- Port: `4174`
- OpenAI timeout: `600` seconds
- OpenAI retries: `3`
- Max output tokens: `30000`
- Proxy bypass: enabled by default
