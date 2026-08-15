from pathlib import Path
import fitz

pdf = Path(r"C:\Users\nimdo\Documents\GitHub\artdaci\tmp\master-plan-final-render\ARTDACI_Master_Production_Plan_Ameliore_FR.pdf")
out = pdf.parent
document = fitz.open(pdf)
matrix = fitz.Matrix(2, 2)
for index, page in enumerate(document):
    pix = page.get_pixmap(matrix=matrix, alpha=False)
    pix.save(out / f"page-{index + 1}.png")
print(f"pages={len(document)}")
