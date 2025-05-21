import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { NAV_CONFIG } from './navConfig';
import { useAuth } from '../Context/AuthContext'; // Context API for company logo
import { allAvailableRoutes } from '../Utils/Rout';

const SideNav = () => {
  const { userRole } = useSelector((state) => state.auth); // Redux
  const { pathname } = useLocation(); // Current route
  const [expandedItems, setExpandedItems] = useState({}); // Dropdown expand state
  const { company = {} } = useAuth(); // Context API for company logo

  const handleToggleExpand = (path) => {
    setExpandedItems((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const isActive = (path) => pathname.startsWith(path);

  const renderNavItem = (item) => {
    const hasChildren = item.items && item.items.length > 0;
    const isExpanded = expandedItems[item.path || item.title];
    const active = isActive(item.path);

    return (
      <React.Fragment key={item.path || item.title}>
        <li className="nav-item">
          {hasChildren ? (
            <div
              role="button"
              className={`nav-link d-flex justify-content-between align-items-center ${active ? 'active' : ''}`}
              onClick={() => handleToggleExpand(item.path || item.title)}
            >
              <i className={`bi bi-${item.icon || 'file'} me-2`}></i>
              {item.title}
              <i className={`bi ${isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'} ms-auto`}></i>
            </div>
          ) : (
            <Link
              to={item.path}
              className={`nav-link d-flex align-items-center ${active ? 'active' : ''}`}
            >
              <i className={`bi bi-${item.icon || 'file'} me-2`}></i>
              {item.title}
            </Link>
          )}
        </li>

        {hasChildren && (
          <ul className={`nav flex-column collapse ${isExpanded ? 'show' : ''} ms-3`}>
            {item.items.map((child) => (
              <li key={child.path} className="nav-item">
                <Link
                  to={child.path}
                  className={`nav-link ${isActive(child.path) ? 'active' : ''}`}
                >
                  {child.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </React.Fragment>
    );
  };

  const getRoleNavItems = useMemo(() => {
    const roleItems = [];
  
    const allowedPaths = allAvailableRoutes.filter(route =>
      route.allowedTypes.some(type => userRole?.includes(type))
    ).map(route => route.path);
  
    userRole?.forEach(role => {
      if (NAV_CONFIG[role]) {
        NAV_CONFIG[role].forEach(item => {
          if (item.items) {
            // For items with children (dropdowns)
            const allowedChildren = item.items.filter(child => allowedPaths.includes(child.path));
            if (allowedChildren.length > 0) {
              roleItems.push({
                ...item,
                items: allowedChildren
              });
            }
          } else {
            // For normal links
            if (allowedPaths.includes(item.path)) {
              roleItems.push(item);
            }
          }
        });
      }
    });
    return roleItems;
  }, [userRole]);
  

  return (
    <div className="side-nav">
      {/* --- Logo Section --- */}
      <div className="logo-container text-center my-3">
        {company?.imageFile ? (
          <img
            src={company.imageFile}
            alt="Company Logo"
            className="company-logo"
          />
        ) : userRole?.includes("company_admin") ? (
          <Link to="/profile" className="add-logo-link text-warning fs-6">
            Add Logo
          </Link>
        ) : userRole?.includes("ems_admin") ? (
          <img
            src="/assets/img/pathbreaker_logo.png"
            alt="EMS Admin Logo"
            className="company-logo"
          />
        ) : null}
      </div>
      {/* --- Navigation Items Section --- */}
      <ul className="nav flex-column">
        {getRoleNavItems.map((item) => renderNavItem(item))}
      </ul>

      <hr />
      {/* Optionally add logout button here later */}
    </div>
  );
};

export default SideNav;
