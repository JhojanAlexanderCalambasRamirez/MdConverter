from markitdown import (
    MarkItDown,
    MarkItDownException,
    FileConversionException,
    UnsupportedFormatException,
    MissingDependencyException,
)


class ConversionEngine:
    def __init__(self):
        self._md = MarkItDown()

    def convert(self, file_path: str) -> dict:
        try:
            result = self._md.convert(file_path)
            return {
                "status": "success",
                "markdown": result.markdown,
                "title": result.title,
            }
        except UnsupportedFormatException as e:
            return {"status": "error", "error": f"Unsupported format: {e}"}
        except FileConversionException as e:
            return {"status": "error", "error": f"Conversion failed: {e}"}
        except MissingDependencyException as e:
            return {"status": "error", "error": f"Missing dependency: {e}"}
        except MarkItDownException as e:
            return {"status": "error", "error": f"MarkItDown error: {e}"}
        except Exception as e:
            return {"status": "error", "error": f"Unexpected error: {e}"}
