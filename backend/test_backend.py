import io
import pypdf
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def create_sample_pdf():
    writer = pypdf.PdfWriter()
    writer.add_blank_page(width=300, height=300)
    out = io.BytesIO()
    writer.write(out)
    return out.getvalue()

def test_health():
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"
    assert "Guava" in res.json()["app"]

def test_merge_endpoint():
    p1 = create_sample_pdf()
    p2 = create_sample_pdf()
    files = [
        ("files", ("guava1.pdf", io.BytesIO(p1), "application/pdf")),
        ("files", ("guava2.pdf", io.BytesIO(p2), "application/pdf")),
    ]
    res = client.post("/api/pdf/merge", files=files)
    assert res.status_code == 200
    reader = pypdf.PdfReader(io.BytesIO(res.content))
    assert len(reader.pages) == 2
