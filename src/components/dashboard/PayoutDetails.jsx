import { useState, useMemo } from 'react';
import { useNews } from '../../context/NewContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast } from 'react-hot-toast';
import {
  ArrowUp,
  ArrowDown,
  Search,
  Filter,
  FileText,
  DollarSign,
  Save,
  Edit,
  Download,
  AlertTriangle
} from 'lucide-react';
import PayoutTrends from './PayoutTrends';

const PayoutDetails = ({ data = [] }) => {
  const { payoutRates, updatePayoutRate } = useNews();
  const [editingRates, setEditingRates] = useState(false);
  const [tempRates, setTempRates] = useState(payoutRates);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isExporting, setIsExporting] = useState(false);
  const [tableSearch, setTableSearch] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    minArticles: '',
    maxArticles: '',
    minPayout: '',
    maxPayout: '',
  });

  const filterPresets = {
    all: {
      label: 'All Time',
      filter: {},
    },
    week: {
      label: 'Last 7 Days',
      filter: {
        minPayout: 0,
      },
    },
    highValue: {
      label: 'High Value Authors',
      filter: {
        minArticles: 5,
        minPayout: 100,
      },
    },
    newAuthors: {
      label: 'New Authors',
      filter: {
        maxArticles: 3,
      },
    },
  };

  const applyPreset = (presetKey) => {
    setSelectedPreset(presetKey);
    setAdvancedFilters(filterPresets[presetKey].filter);
    setShowAdvancedFilters(true);
  };

  const authorStats = useMemo(() => {
    if (!Array.isArray(data)) return {};

    return data.reduce((acc, article) => {
      const author = article.author || 'Unknown';
      if (!acc[author]) {
        acc[author] = { articles: 0, payout: 0 };
      }
      acc[author].articles += 1;
      acc[author].payout += payoutRates.news;
      return acc;
    }, {});
  }, [data, payoutRates.news]);

  const sortedAuthors = useMemo(() => {
    const authors = Object.entries(authorStats).map(([author, stats]) => ({
      author,
      articles: stats.articles,
      payout: stats.payout
    }));

    if (!sortConfig.key) return authors;

    return authors.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [authorStats, sortConfig]);

  const totals = useMemo(() => {
    return sortedAuthors.reduce((acc, row) => ({
      articles: acc.articles + row.articles,
      payout: acc.payout + row.payout
    }), { articles: 0, payout: 0 });
  }, [sortedAuthors]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSaveRates = () => {
    setConfirmDialog(true);
  };

  const confirmRateChange = () => {
    updatePayoutRate('news', Number(tempRates.news));
    updatePayoutRate('blog', Number(tempRates.blog));
    setEditingRates(false);
    setConfirmDialog(false);
    toast.success('Payout rates updated successfully');
  };

  const exportToPDF = () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      const tableData = Object.entries(authorStats).map(([author, stats]) => [
        author,
        stats.articles,
        `$${stats.payout.toFixed(2)}`,
      ]);

      doc.autoTable({
        head: [['Author', 'Articles', 'Payout']],
        body: tableData,
        foot: [['Total', totals.articles, `$${totals.payout.toFixed(2)}`]]
      });

      doc.save('payout-report.pdf');
      toast.success('PDF exported successfully');
    } catch (error) {
      toast.error('Failed to export PDF');
      console.error('PDF export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = () => {
    setIsExporting(true);
    try {
      const csvContent =
        'Author,Articles,Payout\n' +
        Object.entries(authorStats)
          .map(([author, stats]) =>
            `${author},${stats.articles},$${stats.payout.toFixed(2)}`
          )
          .concat(`Total,${totals.articles},$${totals.payout.toFixed(2)}`)
          .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'payout-report.csv';
      link.click();
      toast.success('CSV exported successfully');
    } catch (error) {
      toast.error('Failed to export CSV');
      console.error('CSV export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToGoogleSheets = async () => {
    setIsExporting(true);
    try {
      // Note: In a production app, this should be handled by your backend
      const doc = new GoogleSpreadsheet(import.meta.env.VITE_GOOGLE_SHEET_ID);

      await doc.useServiceAccountAuth({
        client_email: import.meta.env.VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: import.meta.env.VITE_GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      });

      await doc.loadInfo();
      const sheet = doc.sheetsByIndex[0];

      const rows = Object.entries(authorStats).map(([author, stats]) => ({
        Author: author,
        Articles: stats.articles,
        Payout: `$${stats.payout.toFixed(2)}`,
        Date: new Date().toLocaleDateString(),
      }));

      await sheet.addRows(rows);
      toast.success('Successfully exported to Google Sheets');
    } catch (error) {
      console.error('Error exporting to Google Sheets:', error);
      toast.error('Failed to export to Google Sheets');
    } finally {
      setIsExporting(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ?
      <ArrowUpwardIcon fontSize="small" /> :
      <ArrowDownwardIcon fontSize="small" />;
  };

  const filteredAuthors = useMemo(() => {
    return sortedAuthors.filter(row => {
      // Text search
      const matchesSearch =
        row.author.toLowerCase().includes(tableSearch.toLowerCase()) ||
        row.articles.toString().includes(tableSearch) ||
        row.payout.toString().includes(tableSearch);

      // Advanced filters
      const matchesArticles =
        (!advancedFilters.minArticles || row.articles >= Number(advancedFilters.minArticles)) &&
        (!advancedFilters.maxArticles || row.articles <= Number(advancedFilters.maxArticles));

      const matchesPayout =
        (!advancedFilters.minPayout || row.payout >= Number(advancedFilters.minPayout)) &&
        (!advancedFilters.maxPayout || row.payout <= Number(advancedFilters.maxPayout));

      return matchesSearch && matchesArticles && matchesPayout;
    });
  }, [sortedAuthors, tableSearch, advancedFilters]);

  return (
    <div className="space-y-6">
      <PayoutTrends data={data} payoutRates={payoutRates} />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <span className="text-gray-600">Total Articles</span>
            </div>
            <span className="text-xl font-semibold">{totals.articles}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <span className="text-gray-600">Total Payout</span>
            </div>
            <span className="text-xl font-semibold text-green-600">
              ${totals.payout.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Rate Editing Controls */}
            {editingRates ? (
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <div className="flex-1">
                  <input
                    type="number"
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="News Rate"
                    value={tempRates.news}
                    onChange={(e) => setTempRates({ ...tempRates, news: e.target.value })}
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Blog Rate"
                    value={tempRates.blog}
                    onChange={(e) => setTempRates({ ...tempRates, blog: e.target.value })}
                  />
                </div>
                <button
                  onClick={handleSaveRates}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Search table..."
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                  />
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  {showAdvancedFilters ? 'Hide Filters' : 'Advanced Filters'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Filter Presets</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(filterPresets).map(([key, { label }]) => (
                  <button
                    key={key}
                    onClick={() => applyPreset(key)}
                    className={`px-3 py-1 text-sm rounded-md ${
                      selectedPreset === key
                        ? 'bg-blue-500 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <input
                type="number"
                placeholder="Min Articles"
                value={advancedFilters.minArticles}
                onChange={(e) => setAdvancedFilters(prev => ({
                  ...prev,
                  minArticles: e.target.value
                }))}
                className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Max Articles"
                value={advancedFilters.maxArticles}
                onChange={(e) => setAdvancedFilters(prev => ({
                  ...prev,
                  maxArticles: e.target.value
                }))}
                className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Min Payout"
                value={advancedFilters.minPayout}
                onChange={(e) => setAdvancedFilters(prev => ({
                  ...prev,
                  minPayout: e.target.value
                }))}
                className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Max Payout"
                value={advancedFilters.maxPayout}
                onChange={(e) => setAdvancedFilters(prev => ({
                  ...prev,
                  maxPayout: e.target.value
                }))}
                className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('author')}
                >
                  <div className="flex items-center gap-2">
                    Author
                    {getSortIcon('author') && (
                      sortConfig.direction === 'asc' ?
                        <ArrowUp className="h-4 w-4" /> :
                        <ArrowDown className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('articles')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Articles
                    {getSortIcon('articles') && (
                      sortConfig.direction === 'asc' ?
                        <ArrowUp className="h-4 w-4" /> :
                        <ArrowDown className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('payout')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Payout
                    {getSortIcon('payout') && (
                      sortConfig.direction === 'asc' ?
                        <ArrowUp className="h-4 w-4" /> :
                        <ArrowDown className="h-4 w-4" />
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAuthors
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <tr key={row.author} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{row.author}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">{row.articles}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">${row.payout.toFixed(2)}</td>
                  </tr>
                ))}
              <tr className="bg-gray-50 font-semibold">
                <td className="px-6 py-4 whitespace-nowrap">Total</td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {filteredAuthors.reduce((sum, row) => sum + row.articles, 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  ${filteredAuthors.reduce((sum, row) => sum + row.payout, 0).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mobile-friendly pagination */}
        <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 gap-4">
          <div className="flex items-center">
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(0);
              }}
              className="border rounded-md px-2 py-1 text-sm"
            >
              {[5, 10, 25].map((n) => (
                <option key={n} value={n}>
                  {n} per page
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {page + 1} of {Math.ceil(filteredAuthors.length / rowsPerPage)}
            </span>
            <button
              onClick={() => setPage(Math.min(Math.ceil(filteredAuthors.length / rowsPerPage) - 1, page + 1))}
              disabled={page >= Math.ceil(filteredAuthors.length / rowsPerPage) - 1}
              className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={exportToPDF}
          disabled={isExporting}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export PDF'}
        </button>
        <button
          onClick={exportToCSV}
          disabled={isExporting}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Confirm Rate Change</h3>
            <p className="text-gray-600">
              Are you sure you want to update the payout rates to:
            </p>
            <div className="mt-4 space-y-2">
              <p>News Rate: ${tempRates.news}</p>
              <p>Blog Rate: ${tempRates.blog}</p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              <p>This will affect all future payout calculations.</p>
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setConfirmDialog(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmRateChange}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayoutDetails;