import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar — fixed left */}
      <Sidebar />

      {/* Main content — pushed right of sidebar */}
      <div className="ml-64 flex-1 p-6">
        {children}
      </div>
    </div>
  );
};

export default Layout;
