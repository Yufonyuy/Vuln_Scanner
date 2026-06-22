const exportPDF = () => {
  window.open(`/api/scans/${id}/export/pdf/`, '_blank');
};

// Inside the scan detail section:
<button onClick={exportPDF} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
  Export PDF
</button>