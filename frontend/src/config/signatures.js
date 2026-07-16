export const SIGNATURE_IMAGES = {
  "Alif Priatna":     "/signatures/Alif_Priatna.png",
  "Nur Dwi":          "/signatures/Nur_Dwi.png",
  "Rendra Pramono":   "/signatures/Rendra_Pramono.png",
  "Choirul Amin":     "/signatures/Choirul_Amin.png",
  "Andreas Agung":    "/signatures/Andreas_Agung.png",
  "Dwi P":            "/signatures/Dwi_P.png",
  "Tharisa Arrahma":  "/signatures/Tharisa_Arrahma.jpeg",
  "Yulius Permata":   "/signatures/Yulius_Permata.png",
  "Diki Wahyudi":     "/signatures/Diki_Wahyudi.png",
  "Bambang Wuryanto": "/signatures/Bambang_Wuryanto.png",
  "Sugiyarto":        "/signatures/Sugiyarto.png",
  "Eliata Dumar":     "/signatures/Eliata_Dumar.png",
  "Eko Maryanto":     "/signatures/Eko_Maryanto.png",
  "Bagus Santoso":    "/signatures/Bagus_Santoso.png",
  "Sugiyarto":        "/signatures/Sugiyarto.png",
  "Karna Satia":      "/signatures/Karna_Satia.png",
  "Dadi Rosadi":      "/signatures/Dadi_Rosadi.png",
  "M. Sugiarto":      "/signatures/M_Sugiarto.png",
};

export const DEFAULT_APPROVER = {
  name: "BAMBANG WURYANTO",
  role: "DIRECTOR",
  signatureKey: "Bambang Wuryanto",
};

export const DEPARTMENT_SIGNER = {
  "Finance Department":              { name: "YULIUS PERMATA",    role: "SECT. HEAD", signatureKey: "Yulius Permata" },
  "Finance":                         { name: "YULIUS PERMATA",    role: "SECT. HEAD", signatureKey: "Yulius Permata" },
  "HRGA & IT Department":            { name: "DIKI WAHYUDI*",         role: "SECT. HEAD", signatureKey: "Diki Wahyudi" },
  "HRGA & IT":                       { name: "DIKI WAHYUDI*",         role: "SECT. HEAD", signatureKey: "Diki Wahyudi" },
  "Management Development":          { name: "KARNA SATIA SALIM",    role: "STAFF", signatureKey: "Karna Satia" },
  "Management Representative":       { name: "SUGIYARTO*",    role: "SECT. HEAD", signatureKey: "Sugiyarto" },
  "Manufacturing Battery":           { name: "DIONISIUS AUGUSTO**",     role: "SENIOR ENGINEER", signatureKey: "M. Sugiarto" },
  "Manufacturing Cable":             { name: "KARNA SATIA SALIM*",     role: "SECT. HEAD", signatureKey: "Karna Satia" },
  "Marketing Battery Department":    { name: "RENDRA PRAMONO",  role: "DEPT. HEAD", signatureKey: "Rendra Pramono" },
  "Marketing Battery":               { name: "RENDRA PRAMONO",  role: "DEPT. HEAD", signatureKey: "Rendra Pramono" },
  "Marketing Engineering":           { name: "ANDREAS AGUNG S.",    role: "DEPT. HEAD", signatureKey: "Andreas Agung" },
  "MI & SHE":                        { name: "ELIATA DUMAR GINTING", role: "SECT. HEAD", signatureKey: "Eliata Dumar" },
  "PPIC":                            { name: "DIKI WAHYUDI",   role: "DEPT. HEAD", signatureKey: "Diki Wahyudi" },
  "Purchasing":                      { name: "DIKI WAHYUDI* / FAKHDARENI*",   role: "SECT. HEAD", signatureKey: "Diki Wahyudi" },
  "QA (Quality Assurance)":          { name: "M BAGUS SANTOSO", role: "DEPT. HEAD", signatureKey: "Bagus Santoso" },
  "QA (QUALITY ASSURANCE)":          { name: "M BAGUS SANTOSO", role: "DEPT. HEAD", signatureKey: "Bagus Santoso" },
  "Quality Assurance":               { name: "M BAGUS SANTOSO", role: "DEPT. HEAD", signatureKey: "Bagus Santoso" },
};

export const getSignatureInfo = (jobdesc, isFullyApproved = false) => {
  const deptName =
    jobdesc?.department?.name ||
    (typeof jobdesc?.department === "string" ? jobdesc.department : "") ||
    "";

  let signer = DEPARTMENT_SIGNER[deptName];

  if (!signer) {
    signer = DEPARTMENT_SIGNER[deptName.replace(/ Department$/i, "").trim()];
  }
  if (!signer) {
    signer = DEPARTMENT_SIGNER[deptName.replace(/ Dept\.?$/i, "").trim()];
  }

  if (!signer) {
    const deptUpper = deptName.toUpperCase();
    const matchedKey = Object.keys(DEPARTMENT_SIGNER).find(key =>
      deptUpper.includes(key.toUpperCase()) ||
      key.toUpperCase().includes(deptUpper)
    );
    if (matchedKey) signer = DEPARTMENT_SIGNER[matchedKey];
  }

  if (!signer) {
    signer = { name: "DEPT. HEAD", role: "DEPT. HEAD", signatureKey: null };
  }

  return {
    dibuat: {
      name: signer.name,
      role: signer.role,
      signature: signer.signatureKey ? SIGNATURE_IMAGES[signer.signatureKey] ?? null : null,
    },
    disetujui: {
      name: DEFAULT_APPROVER.name,
      role: DEFAULT_APPROVER.role,
      signature: SIGNATURE_IMAGES[DEFAULT_APPROVER.signatureKey] ?? null,
    },
  };
};