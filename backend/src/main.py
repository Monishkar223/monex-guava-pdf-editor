import io
import pypdf
from PIL import Image
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Monex PDF Editor Guava Engine",
    description="100% In-Memory Zero-DB Document & Photo Processing Engine (Guava Natural Edition)",
    version="2.2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health():
    return {
        "status": "ok",
        "app": "Monex PDF Editor (Guava Theme)",
        "mode": "100% In-Memory RAM Engine (Zero Database)"
    }

# 1. Merge PDFs
@app.post("/api/pdf/merge")
async def merge_pdfs(files: list[UploadFile] = File(...)):
    if len(files) < 2:
        raise HTTPException(status_code=400, detail="Provide at least 2 PDF files to merge.")
    try:
        merger = pypdf.PdfMerger()
        for f in files:
            content = await f.read()
            merger.append(io.BytesIO(content))
        
        out = io.BytesIO()
        merger.write(out)
        merger.close()
        out.seek(0)
        return StreamingResponse(
            out,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=Monex_Guava_Merged.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Merge failed: {str(e)}")

# 2. Split PDF
@app.post("/api/pdf/split")
async def split_pdf(file: UploadFile = File(...), page_range: str = Form("1")):
    try:
        content = await file.read()
        reader = pypdf.PdfReader(io.BytesIO(content))
        total = len(reader.pages)
        writer = pypdf.PdfWriter()

        indices = set()
        for item in page_range.split(','):
            item = item.strip()
            if '-' in item:
                parts = item.split('-')
                start_idx = max(0, int(parts[0]) - 1)
                end_idx = min(total, int(parts[1]))
                for i in range(start_idx, end_idx):
                    indices.add(i)
            elif item.isdigit():
                idx = int(item) - 1
                if 0 <= idx < total:
                    indices.add(idx)

        for i in sorted(list(indices)):
            writer.add_page(reader.pages[i])

        out = io.BytesIO()
        writer.write(out)
        out.seek(0)
        return StreamingResponse(
            out,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=Split_{file.filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Split failed: {str(e)}")

# 3. Rotate PDF
@app.post("/api/pdf/rotate")
async def rotate_pdf(file: UploadFile = File(...), angle: int = Form(90)):
    try:
        content = await file.read()
        reader = pypdf.PdfReader(io.BytesIO(content))
        writer = pypdf.PdfWriter()
        for p in reader.pages:
            p.rotate(angle)
            writer.add_page(p)

        out = io.BytesIO()
        writer.write(out)
        out.seek(0)
        return StreamingResponse(
            out,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=Rotated_{file.filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rotate failed: {str(e)}")

# 4. Delete Pages
@app.post("/api/pdf/delete-pages")
async def delete_pages(file: UploadFile = File(...), pages_to_delete: str = Form("1")):
    try:
        content = await file.read()
        reader = pypdf.PdfReader(io.BytesIO(content))
        writer = pypdf.PdfWriter()
        del_set = {int(p.strip()) - 1 for p in pages_to_delete.split(',') if p.strip().isdigit()}

        for i, page in enumerate(reader.pages):
            if i not in del_set:
                writer.add_page(page)

        out = io.BytesIO()
        writer.write(out)
        out.seek(0)
        return StreamingResponse(
            out,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=Edited_{file.filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delete pages failed: {str(e)}")

# 5. Photos to PDF
@app.post("/api/images/to-pdf")
async def images_to_pdf(files: list[UploadFile] = File(...)):
    if not files:
        raise HTTPException(status_code=400, detail="Provide at least one image.")
    try:
        imgs = []
        for f in files:
            data = await f.read()
            img = Image.open(io.BytesIO(data)).convert("RGB")
            imgs.append(img)

        out = io.BytesIO()
        imgs[0].save(
            out,
            format="PDF",
            save_all=True,
            append_images=imgs[1:] if len(imgs) > 1 else []
        )
        out.seek(0)
        return StreamingResponse(
            out,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=Guava_Photos.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image conversion failed: {str(e)}")

# 6. Protect PDF (Password Encryption)
@app.post("/api/pdf/protect")
async def protect_pdf(file: UploadFile = File(...), password: str = Form(...)):
    try:
        content = await file.read()
        reader = pypdf.PdfReader(io.BytesIO(content))
        writer = pypdf.PdfWriter()
        for p in reader.pages:
            writer.add_page(p)

        writer.encrypt(password)
        out = io.BytesIO()
        writer.write(out)
        out.seek(0)
        return StreamingResponse(
            out,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=Protected_{file.filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Encryption failed: {str(e)}")

# 7. Unlock PDF
@app.post("/api/pdf/unlock")
async def unlock_pdf(file: UploadFile = File(...), password: str = Form(...)):
    try:
        content = await file.read()
        reader = pypdf.PdfReader(io.BytesIO(content))
        if reader.is_encrypted:
            res = reader.decrypt(password)
            if res == 0:
                raise HTTPException(status_code=401, detail="Incorrect password.")
        
        writer = pypdf.PdfWriter()
        for p in reader.pages:
            writer.add_page(p)

        out = io.BytesIO()
        writer.write(out)
        out.seek(0)
        return StreamingResponse(
            out,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=Unlocked_{file.filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unlock failed: {str(e)}")

# 8. Extract Text
@app.post("/api/pdf/extract-text")
async def extract_text(file: UploadFile = File(...)):
    try:
        content = await file.read()
        reader = pypdf.PdfReader(io.BytesIO(content))
        pages = [{"page": i + 1, "text": p.extract_text() or ""} for i, p in enumerate(reader.pages)]
        return JSONResponse(content={"filename": file.filename, "pages": pages})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Extract text failed: {str(e)}")
