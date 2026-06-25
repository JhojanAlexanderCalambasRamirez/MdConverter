import sys
import json
import os

from converter.engine import ConversionEngine
from converter.file_utils import resolve_output_path


def main():
    engine = ConversionEngine()

    print(json.dumps({"status": "ready"}), flush=True)

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue

        try:
            request = json.loads(line)
        except json.JSONDecodeError as e:
            print(json.dumps({"status": "error", "error": f"Invalid JSON: {e}"}), flush=True)
            continue

        action = request.get("action")
        request_id = request.get("id")

        if action == "shutdown":
            break

        if action == "convert":
            file_path = request.get("path")
            if not file_path:
                print(json.dumps({"id": request_id, "status": "error", "error": "Missing 'path'"}), flush=True)
                continue

            if not os.path.isfile(file_path):
                print(json.dumps({"id": request_id, "status": "error", "error": f"File not found: {file_path}"}), flush=True)
                continue

            result = engine.convert(file_path)

            if result["status"] == "success":
                output_path = resolve_output_path(file_path)
                try:
                    with open(output_path, "w", encoding="utf-8") as f:
                        f.write(result["markdown"])
                    result["output_path"] = output_path
                except OSError as e:
                    result = {"status": "error", "error": f"Failed to write output: {e}"}

            result["id"] = request_id
            print(json.dumps(result), flush=True)
        else:
            print(json.dumps({"id": request_id, "status": "error", "error": f"Unknown action: {action}"}), flush=True)


if __name__ == "__main__":
    main()
