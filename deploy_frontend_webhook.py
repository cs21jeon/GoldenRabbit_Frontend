from flask import Flask, request
import hmac
import hashlib
import subprocess

app = Flask(__name__)

# GitHub Webhook 설정 시 입력한 Secret 값과 반드시 일치해야 함
GITHUB_SECRET = b'goldenrabbit_frontend_9402'  # 👈 이 부분은 필요시 수정하세요

@app.route("/frontend-webhook", methods=["POST"])
def webhook():
    signature = request.headers.get("X-Hub-Signature-256")
    if signature is None:
        return "Signature missing", 400

    payload = request.get_data()
    mac = hmac.new(GITHUB_SECRET, msg=payload, digestmod=hashlib.sha256)
    expected_signature = "sha256=" + mac.hexdigest()

    if not hmac.compare_digest(expected_signature, signature):
        return "Invalid signature", 403

    # 인증 성공 시 배포 실행
    try:
        # Git pull with detailed output
        result = subprocess.run(
            ["sudo", "git", "-C", "/home/sftpuser/www", "pull"],
            check=True,
            capture_output=True,
            text=True
        )
        # Log success and output
        print(f"Git pull output: {result.stdout}")
        subprocess.run(["sudo", "systemctl", "restart", "vworld"], check=True)
        return f"Deployed successfully. Git output: {result.stdout}", 200
    except subprocess.CalledProcessError as e:
        # Log detailed error
        error_msg = f"Deployment failed: {e}. Stdout: {e.stdout}, Stderr: {e.stderr}"
        print(error_msg)
        return error_msg, 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=9001)
