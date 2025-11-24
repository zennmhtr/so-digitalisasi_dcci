import React from 'react';
import { X, Download, Printer, Edit, Trash2 } from 'lucide-react';

const JobdescViewer = ({ user, jobdesc, onClose, onEdit, onDelete, viewOnly = false }) => {
  if (!jobdesc) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-6 border w-full max-w-md shadow-lg rounded-lg bg-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">No Job Description Found</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-gray-600 mb-4">
            No job description found for {user?.name || 'this member'}.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  console.log('JobdescViewer - jobdesc data:', jobdesc);
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const jobDescContent = document.querySelector('.border-2.border-black').innerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Job Description</title>
        <style>
          @page { 
            size: A4 portrait; 
            margin: 3mm; 
            border: 2px solid #000;
          }
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 2mm; 
            background: white; 
            color: black;
            width: 100%;
            min-height: 100vh;
            box-sizing: border-box;
            border: 2px solid #000;
            font-size: 11px;
            line-height: 1.3;
          }
          .border-2 { 
            border: none; 
            width: 100%;
            min-height: 100%;
            margin: 0;
            box-sizing: border-box;
          }
          .border-black { border-color: #000 !important; }
          .border-b-2 { border-bottom: 2px solid #000 !important; }
          .border-r-2 { border-right: 2px solid #000 !important; }
          .border-b { border-bottom: 1px solid #000 !important; }
          .border-r { border-right: 1px solid #000 !important; }
          .flex { display: flex; }
          .flex-1 { flex: 1; }
          .flex-col { flex-direction: column; }
          .items-center { align-items: center; }
          .justify-center { justify-content: center; }
          .justify-between { justify-content: space-between; }
          .text-center { text-align: center; }
          .grid { display: grid; }
          .grid-cols-2 { 
            grid-template-columns: repeat(2, 1fr); 
            gap: 1.2rem;
          }
          .gap-8 { gap: 1.2rem; }
          .space-x-8 > * + * { margin-left: 1.2rem; }
          .space-y-1 > * + * { margin-top: 0.3rem; }
          .w-32 { width: 7rem; }
          .w-40 { width: 8.5rem; }
          .w-44 { width: 10rem; }
          .w-64 { width: 14rem; }
          .p-1 { padding: 0.2rem; }
          .p-2 { padding: 0.6rem; }
          .p-3 { padding: 0.8rem; }
          .p-4 { padding: 1.0rem; }
          .p-6 { padding: 0.8rem; }
          .p-7 { padding: 1.0rem; }
          .p-8 { padding: 1.2rem; }
          .p-12 { padding: 2.0rem; }
          .mb-2 { margin-bottom: 0.5rem; }
          .mb-3 { margin-bottom: 0.6rem; }
          .ml-2 { margin-left: 0.5rem; }
          .mr-2 { margin-right: 0.5rem; }
          .ml-6 { margin-left: 1.0rem; }
          .ml-8 { margin-left: 1.5rem; }
          .text-xl { 
            font-size: 16px; 
            font-weight: bold; 
            line-height: 1.3;
          }
          .text-sm { 
            font-size: 12px; 
            line-height: 1.3;
          }
          .text-xs { 
            font-size: 10px; 
            line-height: 1.2;
          }
          .font-bold { font-weight: bold; }
          .font-semibold { font-weight: 600; }
          .italic { font-style: italic; }
          .list-decimal { 
            list-style-type: decimal; 
            padding-left: 1.2rem;
            margin: 0.4rem 0;
          }
          .list-inside { list-style-position: inside; }
          img { 
            max-width: 100%; 
            max-height: 50px; 
            object-fit: contain; 
          }
          
          /* Optimize space usage */
          ol, ul {
            margin: 0.4rem 0;
            padding-left: 1.2rem;
          }
          li {
            margin-bottom: 0.3rem;
            line-height: 1.3;
          }
          
          /* Compact sections */
          .content-section {
            margin-bottom: 0;
          }
          
          /* Header section optimization */
          .header-section {
            flex-shrink: 0;
            min-height: auto;
          }
            break-after: avoid;
          }
          
          /* Each major section styling */
          .job-section {
            padding: 0.8rem 1rem;
            margin-bottom: 0.5rem;
          }
          
          /* Ensure proper page margins are maintained */
          html, body {
            box-sizing: border-box;
          }
          /* Image sizing for larger container */
          img {
            max-width: 100%;
            max-height: 90px;
            object-fit: contain;
          }
          
          /* SIMPLE BORDER FIX - LANGSUNG KE INTINYA */
          
          /* Hilangkan semua gap dan margin */
          * {
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
          }
          
          /* Container utama tanpa padding sama sekali */
          body, .border-2 {
            padding: 0 !important;
            margin: 0 !important;
          }
          
          /* Semua elemen border langsung ke tepi */
          .border-b, .border-b-2, .border-r, .border-r-2 {
            position: relative !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          /* Konten dalam elemen diberi padding terpisah */
          .p-1 { padding: 0.2rem !important; }
          .p-2 { padding: 0.4rem !important; }
          .p-3 { padding: 0.5rem !important; }
          .p-6 { padding: 0.8rem !important; }
          .p-8 { padding: 1.0rem !important; }
          .p-12 { padding: 1.8rem !important; }
          
          /* Khusus untuk margin-left spacing section titles */
          .ml-8 { margin-left: 1.5rem !important; }
        </style>
      </head>
      <body>
        <div class="border-2 border-black">
          ${jobDescContent}
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const handleDownload = () => {
    handlePrint();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-6 border w-full max-w-4xl shadow-lg rounded-lg bg-white my-8">
        {/* Header with Actions */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Job Description</h3>
            <p className="text-gray-600 text-sm mt-1">
              Employee: <span className="font-medium">{user.name}</span> ({user.noPNK})
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {!viewOnly && (
              <>
                <button
                  onClick={onEdit}
                  className="flex items-center px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit Job Description"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={onDelete}
                  className="flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Job Description"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </button>
              </>
            )}
            <button
              onClick={handlePrint}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Print"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Download PDF"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Job Description Document Format */}
        <div className="bg-white border-2 border-black print:border-black" style={{ fontFamily: 'Arial, sans-serif' }}>
          {/* Header Section */}
          <div className="border-b-2 border-black">
            <div className="flex">
              {/* Logo and Company Section */}
              <div className="w-64 border-r-2 border-black p-2">
                <div className="flex flex-col items-center">
                  <img 
                    src="/images/dcilong.png" 
                    alt="Dharma Group Logo" 
                    className="max-w-full max-h-26 object-contain mb-2"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/images/dcilong.png";
                    }}
                  />
                 
                </div>
              </div>
              
              {/* Title Section */}
              <div className="flex-1 border-r-2 border-black flex flex-col justify-between p-2">
                <div></div>
                <div className="text-center">
                  <h1 className="text-xl font-bold italic">JOB DESCRIPTION</h1>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="text-left">
                    <span className="font-medium">Tanggal: </span>
                    <span>{jobdesc?.tanggal ? new Date(jobdesc.tanggal).toLocaleDateString('id-ID') : new Date().toLocaleDateString('id-ID')}</span>
                  </div>
                  <div className="text-left">
                    <span className="font-medium">Revisi: </span>
                    <span>{jobdesc?.revisi || '0'}</span>
                  </div>
                </div>
              </div>
              
              {/* Dibuat Section */}
              <div className="w-32 border-r-2 border-black">
                <div className="border-b border-black p-1 text-center">
                  <p className="text-xs font-bold">Dibuat,</p>
                </div>
                <div className="border-b border-black p-12 text-center">
                  {/* Space for signature */}
                </div>
              </div>

              {/* Disetujui Section */}
              <div className="w-32">
                <div className="border-b border-black p-1 text-center">
                  <p className="text-xs font-bold">Disetujui,</p>
                </div>
                <div className="border-b border-black p-12 text-center">
                  {/* Space for signature */}
                </div>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="border-b-2 border-black">
            <div className="flex">
              <div className="flex-1 border-r border-black">
                <div className="border-b border-black p-3">
                  <div className="flex">
                    <span className="font-bold w-32">DIVISION</span>
                    <span className="mr-2">:</span>
                    <span>{jobdesc?.division || '-'}</span>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex">
                    <span className="font-bold w-32">POSITION TITLE</span>
                    <span className="mr-2">:</span>
                    <span>{jobdesc?.positionTitle || '-'}</span>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="border-b border-black p-3">
                  <div className="flex">
                    <span className="font-bold w-32">DEPARTMENT</span>
                    <span className="mr-2">:</span>
                    <span>{(jobdesc?.department?.name || user?.department?.name || '-').toUpperCase()}</span>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex">
                    <span className="font-bold w-32">REPORTS TO</span>
                    <span className="mr-2">:</span>
                    <span>{jobdesc?.reportsTo || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Responsibilities */}
          <div className="border-b border-black p-3">
            <div className="mb-2">
              <span className="font-bold text-sm">RESPONSIBILITIES</span>
              <span className="text-xs ml-8">(Responsibilities berisi urutan tugas pemegang jabatan serta tugas-tugas yang dilaksanakannya - berkaitan dengan jabatan yang dipegangnya, bisa tugas harian atau tugas bekala)</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              {jobdesc?.responsibilities && jobdesc.responsibilities.length > 0 ? (
                jobdesc.responsibilities.map((responsibility, index) => (
                  <li key={index}>{responsibility}</li>
                ))
              ) : (
                <li>No responsibilities defined</li>
              )}
            </ol>
          </div>

          {/* Accountabilities */}
          <div className="border-b border-black p-3">
            <div className="mb-2">
              <span className="font-bold text-sm">ACCOUNTABILITIES</span>
              <span className="text-xs ml-8">Accountabilities berisi wewenang yang dilimpahkan kepada jabatan untuk dapat melaksanakan tugas dengan baik, dan hal-hal apa yang diberikan oleh jabatan ini tetapi tidak diberikan kepada jabatan yang lain, bisa berisi :</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              {jobdesc?.accountabilities && jobdesc.accountabilities.length > 0 ? (
                jobdesc.accountabilities.map((accountability, index) => (
                  <li key={index}>{accountability}</li>
                ))
              ) : (
                <li>No accountabilities defined</li>
              )}
            </ol>
          </div>

          {/* Interactions */}
          <div className="border-b border-black p-3">
            <div className="mb-2">
              <span className="font-bold text-sm">INTERACTIONS</span>
              <span className="text-xs ml-8">(Interaksi berisi  bagian / dengan siapa saja yang bersangkutan berhubungan / bekerjasama untuk kelancaran tugas - tugasnya, baik didalam maupun diluar perusahaan)</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              {jobdesc?.interactions?.internal && jobdesc.interactions.internal.length > 0 ? (
                jobdesc.interactions.internal.map((interaction, index) => (
                  <li key={index}>{interaction}</li>
                ))
              ) : (
                <li>No interactions defined</li>
              )}
            </ol>
          </div>

          {/* Competence */}
          <div className="border-b border-black p-3">
            <div className="mb-2">
              <span className="font-bold text-sm">COMPETENCE</span>
              <span className="text-xs ml-8"> (Competence berisi keahlian dan / atau pengetahuan khusus yang harus dimiliki pemegang jabatan untuk dapat berhasil dalam melaksanakan tugasnya. Diberikan juga lamanya waktu minimal pengalaman dibidang tersebut)</span>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="font-bold text-sm mb-2">A. Competence Managerial :</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  {jobdesc.competence?.managerial && jobdesc.competence.managerial.length > 0 ? (
                    jobdesc.competence.managerial.map((comp, index) => (
                      <li key={index}>{comp}</li>
                    ))
                  ) : (
                    <>
                      <li>Teamwork</li>
                      <li>Trouble Shooting</li>
                      <li>Customer Satisfaction</li>
                      <li>Cross Functional Capability</li>
                      <li>Quality Focus</li>
                      <li>Cost Efficiency</li>
                      <li>Continuous Improvement</li>
                      <li>Planning Monitoring</li>
                      <li>Personal Integrity</li>
                      <li>Drive for Result</li>
                    </>
                  )}
                </ol>
              </div>
              
              <div>
                <p className="font-bold text-sm mb-2">B. Competence Skill :</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  {jobdesc.competence?.skill && jobdesc.competence.skill.length > 0 ? (
                    jobdesc.competence.skill.map((skill, index) => (
                      <li key={index}>{skill}</li>
                    ))
                  ) : (
                    <>
                      <li>Microsoft Office</li>
                      <li>Komunikasi</li>
                      <li>Negosiasi</li>
                      <li>SAP</li>
                      <li>Control Plan</li>
                    </>
                  )}
                </ol>
              </div>
            </div>
          </div>

          {/* Job Specification */}
          <div className="p-3">
            <div className="mb-2">
              <span className="font-bold text-sm">JOB SPECIFICATION</span>
              <span className="text-xs ml-8">(berisi persyaratan yang harus dipenuhi pemegang jabatan)</span>
            </div>
            
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div className="space-y-1">
                <div className="flex">
                  <span className="w-44">Usia</span>
                  <span className="mr-2">:</span>
                  <span>{jobdesc.jobSpecification?.age || 'Min. 21 Tahun'}</span>
                </div>
                <div className="flex">
                  <span className="w-44">Pendidikan</span>
                  <span className="mr-2">:</span>
                  <span>{jobdesc.jobSpecification?.education || 'Minimal D3'}</span>
                </div>
                <div className="flex">
                  <span className="w-44">Pendidikan Non Formal</span>
                  <span className="mr-2">:</span>
                  <span>{jobdesc.jobSpecification?.nonFormalEducation || '-'}</span>
                </div>
                <div className="flex">
                  <span className="w-44">Pengalaman Kerja</span>
                  <span className="mr-2">:</span>
                  <span>{jobdesc.jobSpecification?.experience || 'Min. 1 Tahun'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles - Simplified */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          .print\\:hidden {
            display: none !important;
          }
        }
      `}} />
    </div>
  );
};

export default JobdescViewer;