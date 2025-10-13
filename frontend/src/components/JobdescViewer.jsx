import React from 'react';
import { X, Download, Printer, Edit, Trash2 } from 'lucide-react';

const JobdescViewer = ({ user, jobdesc, onClose, onEdit, onDelete }) => {
  // Handle case where jobdesc is null or undefined
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

  console.log('JobdescViewer - jobdesc data:', jobdesc); // Debug log
  const handlePrint = () => {
    // Hide non-printable elements and print
    const printElements = document.querySelectorAll('.print\\:hidden');
    printElements.forEach(el => el.style.display = 'none');
    
    window.print();
    
    // Restore elements after printing
    setTimeout(() => {
      printElements.forEach(el => el.style.display = '');
    }, 1000);
  };

  const handleDownload = () => {
    handlePrint(); // For now, use print dialog which can save as PDF
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
              {/* Logo Section */}
              <div className="w-32 border-r-2 border-black p-2 flex items-center justify-center">
                <img 
                  src="/images/dcilong.png" 
                  alt="Dharma Group Logo" 
                  className="max-w-full max-h-20 object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/images/dcilong.png"; // Fallback logo
                  }}
                />
              </div>
              
              {/* Title Section */}
              <div className="flex-1 text-center p-4 border-r-2 border-black">
                <h1 className="text-xl font-bold mb-2">JOB DESCRIPTION</h1>
                <p className="text-sm font-semibold mb-3">PT DHARMA CONTROLCABLE IND</p>
                <div className="flex justify-center space-x-8 text-xs">
                  <div>
                    <span className="font-medium">Tanggal: </span>
                    <span>{jobdesc?.tanggal ? new Date(jobdesc.tanggal).toLocaleDateString('id-ID') : new Date().toLocaleDateString('id-ID')}</span>
                  </div>
                  <div>
                    <span className="font-medium">Revisi: </span>
                    <span>{jobdesc?.revisi || '0'}</span>
                  </div>
                </div>
              </div>
              
              {/* Dibuat Section */}
              <div className="w-32 border-r-2 border-black">
                <div className="border-b border-black p-2 text-center">
                  <p className="text-xs font-bold">Dibuat,</p>
                </div>
                <div className="border-b border-black p-7 text-center">
                  {/* Space for signature */}
                </div>
              </div>

              {/* Disetujui Section */}
              <div className="w-32">
                <div className="border-b border-black p-2 text-center">
                  <p className="text-xs font-bold">Disetujui,</p>
                </div>
                <div className="border-b border-black p-7 text-center">
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
                    <span>{jobdesc?.department?.name || user?.department?.name || '-'}</span>
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
              <span className="text-xs ml-2">(Responsibilities berisi urutan tugas pemegang jabatan serta tugas-tugas yang dilaksanakannya ; berurutan dengan jabatan yang dipegannya, bisa tugas harian atau tugas bulanan)</span>
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
              <span className="text-xs ml-2">(Accountabilities berisi wewenang yang dilimpahkan kepada jabatan untuk dapat melaksanakan tugas dengan baik ; dan berisi apa yang dibeisakan oleh jabatan pada berapa persen di target yang dicapai kepada jabatan yang lebih tinggi)</span>
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
              <span className="text-xs ml-2">(Interaksi berisi bagian / dengan siapa saja yang bersangkutan berhubungan / bekerjasama untuk kelancaran tugas - tugasnya )</span>
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
              <span className="text-xs ml-2">(Competence berisi keahlian dan / atau pengetahuan khusus yang harus dimiliki pemegang jabatan untuk dapat berhasil dalam melaksanakan tugasnya)</span>
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
              <span className="text-xs ml-2">(Berisi persyaratan yang harus dipenuhi pemegang jabatan)</span>
            </div>
            
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div className="space-y-1">
                <div className="flex">
                  <span className="w-32">Usia</span>
                  <span className="mr-2">:</span>
                  <span>{jobdesc.jobSpecification?.age || 'Min. 21 Tahun'}</span>
                </div>
                <div className="flex">
                  <span className="w-32">Pendidikan</span>
                  <span className="mr-2">:</span>
                  <span>{jobdesc.jobSpecification?.education || 'Minimal D3'}</span>
                </div>
                <div className="flex">
                  <span className="w-32">Pendidikan Non Formal</span>
                  <span className="mr-2">:</span>
                  <span>{jobdesc.jobSpecification?.nonFormalEducation || '-'}</span>
                </div>
                <div className="flex">
                  <span className="w-32">Pengalaman Kerja</span>
                  <span className="mr-2">:</span>
                  <span>{jobdesc.jobSpecification?.experience || 'Min. 1 Tahun'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .fixed {
            position: static !important;
            visibility: visible !important;
          }
          .fixed * {
            visibility: visible !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .bg-gray-600 {
            background: white !important;
          }
          .shadow-lg {
            box-shadow: none !important;
          }
          .rounded-lg {
            border-radius: 0 !important;
          }
          .border {
            border: none !important;
          }
          .p-6 {
            padding: 0 !important;
          }
          .my-8 {
            margin: 0 !important;
          }
          .max-w-5xl {
            max-width: 100% !important;
          }
          .mx-auto {
            margin: 0 !important;
          }
          .top-4 {
            top: 0 !important;
          }
          .relative {
            position: static !important;
          }
          @page {
            size: A4;
            margin: 15mm;
          }
        }
      `}} />
    </div>
  );
};

export default JobdescViewer;