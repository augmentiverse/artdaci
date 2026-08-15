from docx import Document

d = Document(r"artifacts/ARTDACI_Livre_imprime_Quatre_Maitres_FR.docx")
for a, b in [(48, 76), (108, 136), (168, 196), (228, 256), (256, 275)]:
    print("---", a, b)
    for i in range(a, b):
        p = d.paragraphs[i]
        xml = p._p.xml
        print(i, p.style.name, repr(p.text[:90]), "pageBreakBefore" in xml, xml.count('w:type="page"'))
