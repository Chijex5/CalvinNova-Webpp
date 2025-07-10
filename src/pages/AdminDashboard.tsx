import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import Button from '../components/Button';
import { UserIcon, ShoppingBagIcon, MessageSquareIcon, FlagIcon, SearchIcon, TrashIcon, CheckIcon, XIcon } from 'lucide-react';
const AdminDashboard = () => {
  const navigate = useNavigate();
  const {
    user,
    isAdmin
  } = useAuth();
  const {
    products,
    deleteProduct
  } = useProducts();
  const [activeTab, setActiveTab] = useState('products');
  const [searchQuery, setSearchQuery] = useState('');
  if (!user || !user.role || user.role !== 'admin') {
    return <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="mb-6">
          You need administrator privileges to access this page.
        </p>
        <Button variant="primary" onClick={() => navigate('/')}>
          Return to Home
        </Button>
      </div>;
  }
  // Mock data for admin dashboard
  const users = [{
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    status: 'active',
    joinDate: '2023-01-15'
  }, {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    status: 'active',
    joinDate: '2023-02-20'
  }, {
    id: '3',
    name: 'Michael Brown',
    email: 'michael@example.com',
    status: 'active',
    joinDate: '2023-03-10'
  }, {
    id: '4',
    name: 'Emily Davis',
    email: 'emily@example.com',
    status: 'active',
    joinDate: '2023-04-05'
  }, {
    id: '5',
    name: 'David Wilson',
    email: 'david@example.com',
    status: 'suspended',
    joinDate: '2023-05-12'
  }];
  const reports = [{
    id: '1',
    reportedBy: 'Emily Davis',
    against: 'David Wilson',
    type: 'user',
    reason: 'Inappropriate messages',
    date: '2023-05-20',
    status: 'pending'
  }, {
    id: '2',
    reportedBy: 'John Doe',
    against: 'Wireless Headphones',
    type: 'product',
    reason: 'Misleading description',
    date: '2023-05-18',
    status: 'resolved'
  }, {
    id: '3',
    reportedBy: 'Sarah Johnson',
    against: 'Michael Brown',
    type: 'user',
    reason: 'No-show at meetup',
    date: '2023-05-15',
    status: 'pending'
  }];
  const filteredProducts = products.filter(product => product.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredUsers = users.filter(user => user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredReports = reports.filter(report => report.reportedBy.toLowerCase().includes(searchQuery.toLowerCase()) || report.against.toLowerCase().includes(searchQuery.toLowerCase()) || report.reason.toLowerCase().includes(searchQuery.toLowerCase()));
  return <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white h-screen shadow-md fixed">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-blue-600">Admin Dashboard</h1>
          </div>
          <nav className="p-4">
            <button onClick={() => setActiveTab('products')} className={`flex items-center w-full p-3 mb-2 rounded-md text-left ${activeTab === 'products' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}>
              <ShoppingBagIcon size={20} className="mr-3" />
              <span>Products</span>
            </button>
            <button onClick={() => setActiveTab('users')} className={`flex items-center w-full p-3 mb-2 rounded-md text-left ${activeTab === 'users' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}>
              <UserIcon size={20} className="mr-3" />
              <span>Users</span>
            </button>
            <button onClick={() => setActiveTab('reports')} className={`flex items-center w-full p-3 mb-2 rounded-md text-left ${activeTab === 'reports' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}>
              <FlagIcon size={20} className="mr-3" />
              <span>Reports</span>
            </button>
            <button onClick={() => setActiveTab('messages')} className={`flex items-center w-full p-3 mb-2 rounded-md text-left ${activeTab === 'messages' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}>
              <MessageSquareIcon size={20} className="mr-3" />
              <span>Messages</span>
            </button>
          </nav>
          <div className="p-4 mt-auto border-t border-gray-200">
            <Button variant="outline" fullWidth onClick={() => navigate('/')}>
              Back to Site
            </Button>
          </div>
        </div>
        {/* Main Content */}
        <div className="ml-64 flex-1 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {activeTab === 'products' && 'Manage Products'}
              {activeTab === 'users' && 'Manage Users'}
              {activeTab === 'reports' && 'Reports'}
              {activeTab === 'messages' && 'Messages'}
            </h2>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon size={18} className="text-gray-400" />
              </div>
              <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </div>
          {/* Products Tab */}
          {activeTab === 'products' && <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seller
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.length > 0 ? filteredProducts.map(product => <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 mr-3">
                              <img className="h-10 w-10 rounded-md object-cover" src={product.images[0]} alt="" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {product.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {product.school}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            ${product.price.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Seller ID: {product.sellerId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-red-600 hover:text-red-900 mr-3" onClick={() => deleteProduct(product.id)}>
                            <TrashIcon size={18} />
                          </button>
                          <button className="text-blue-600 hover:text-blue-900" onClick={() => navigate(`/product/${product.id}`)}>
                            View
                          </button>
                        </td>
                      </tr>) : <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        No products found
                      </td>
                    </tr>}
                </tbody>
              </table>
            </div>}
          {/* Users Tab */}
          {activeTab === 'users' && <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map(user => <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {user.id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.joinDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                          Edit
                        </button>
                        {user.status === 'active' ? <button className="text-red-600 hover:text-red-900">
                            Suspend
                          </button> : <button className="text-green-600 hover:text-green-900">
                            Activate
                          </button>}
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>}
          {/* Reports Tab */}
          {activeTab === 'reports' && <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Report Details
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReports.map(report => <tr key={report.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {report.reportedBy} reported {report.against}
                        </div>
                        <div className="text-sm text-gray-500">
                          Reason: {report.reason}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${report.type === 'user' ? 'bg-purple-100 text-purple-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {report.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${report.status === 'pending' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-green-600 hover:text-green-900 mr-2">
                          <CheckIcon size={18} />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <XIcon size={18} />
                        </button>
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>}
          {/* Messages Tab */}
          {activeTab === 'messages' && <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-center text-gray-500">
                Message monitoring feature coming soon.
              </p>
            </div>}
        </div>
      </div>
    </div>;
};
export default AdminDashboard;