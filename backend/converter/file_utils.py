import os


def resolve_output_path(input_path: str) -> str:
    directory = os.path.dirname(input_path)
    basename = os.path.splitext(os.path.basename(input_path))[0]
    output_path = os.path.join(directory, f"{basename}.md")

    if not os.path.exists(output_path):
        return output_path

    counter = 1
    while True:
        candidate = os.path.join(directory, f"{basename} ({counter}).md")
        if not os.path.exists(candidate):
            return candidate
        counter += 1
