import { useEffect, useMemo, useState } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import './App.css';

const dealerRoles = ['Pending Dealer', 'Dealer', 'Rejected Dealer'];
const accountRoles = ['All', 'Customer', ...dealerRoles];

function App() {
  const [page, setPage] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [customerRoleFilter, setCustomerRoleFilter] = useState('All');
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');
  const [servicesError, setServicesError] = useState('');
  const [usersError, setUsersError] = useState('');

  useEffect(() => {
    const unsubscribeOrders = onSnapshot(
      collection(db, 'orders'),
      (snapshot) => {
        setOrders(snapshot.docs
          .map((item) => ({
            id: item.id,
            ...item.data(),
          }))
          .sort((first, second) => {
            const firstTime = first.createdAt?.toMillis?.() || 0;
            const secondTime = second.createdAt?.toMillis?.() || 0;
            return secondTime - firstTime;
          }));
        setOrdersLoading(false);
        setOrdersError('');
      },
      (err) => {
        console.error('Orders:', err);
        setOrdersError('Unable to load orders. Check Firebase configuration and Firestore rules.');
        setOrdersLoading(false);
      }
    );

    const unsubscribeServices = onSnapshot(
      collection(db, 'serviceRequests'),
      (snapshot) => {
        setServices(snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        })));
        setServicesLoading(false);
        setServicesError('');
      },
      (err) => {
        console.error('Service requests:', err);
        setServicesError('Unable to load service requests. Check Firestore rules.');
        setServicesLoading(false);
      }
    );

    const unsubscribeUsers = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        setUsers(snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        })));
        setUsersLoading(false);
        setUsersError('');
      },
      (err) => {
        console.error('Users:', err);
        setUsersError('Unable to load customer and dealer profiles. Check Firestore rules.');
        setUsersLoading(false);
      }
    );

    return () => {
      unsubscribeOrders();
      unsubscribeServices();
      unsubscribeUsers();
    };
  }, []);

  async function changeOrderStatus(id, status) {
    try {
      await updateDoc(doc(db, 'orders', id), { status });
    } catch (err) {
      console.error(err);
      alert('Could not update order status.');
    }
  }

  async function changeServiceStatus(id, status) {
    try {
      await updateDoc(doc(db, 'serviceRequests', id), { status });
    } catch (err) {
      console.error(err);
      alert('Could not update service request.');
    }
  }

  async function changeDealerStatus(id, role) {
    try {
      await updateDoc(doc(db, 'users', id), { role });
    } catch (err) {
      console.error(err);
      alert('Could not update dealer status. Check Firestore permissions.');
    }
  }

  const usersById = useMemo(
    () => new Map(users.map((user) => [user.id, user])),
    [users]
  );

  const customers = useMemo(
    () => users.filter((user) => !dealerRoles.includes(accountRole(user))),
    [users]
  );

  const dealers = useMemo(
    () => users.filter((user) => dealerRoles.includes(accountRole(user))),
    [users]
  );

  const filteredUsers = useMemo(
    () => users.filter((user) =>
      customerRoleFilter === 'All' || accountRole(user) === customerRoleFilter
    ),
    [users, customerRoleFilter]
  );

  const money = (value) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);

  const date = (value) => {
    if (!value) return '—';
    const parsed = value?.toDate ? value.toDate() : new Date(value);
    return Number.isNaN(parsed.getTime())
      ? '—'
      : parsed.toLocaleString('en-IN');
  };

  const orderTotal = (order) => {
    const savedTotal = order.total ?? order.totalAmount ?? order.amount;
    if (savedTotal != null) return savedTotal;

    const items = orderItems(order);
    if (!items.length || !items.some((item) => item?.unitPrice != null || item?.price != null)) {
      return null;
    }
    return items.reduce(
      (sum, item) => sum + Number(item?.unitPrice ?? item?.price ?? 0) *
        Number(item?.quantity ?? item?.qty ?? 1),
      0
    );
  };

  const orderStatus = (order) => order.status || 'Pending';

  const profileValue = (value) =>
    typeof value === 'string' && value.trim() ? value.trim() : 'Not provided';

  const orderItems = (order) => {
    const items = order.items ?? order.products ?? [];
    if (Array.isArray(items)) return items;
    if (items && typeof items === 'object') return Object.values(items);
    return [];
  };

  const productLabel = (item) =>
    item?.productName || item?.name || item?.title || item?.product?.name || 'Product';

  const productQuantity = (item) =>
    item?.quantity ?? item?.qty ?? item?.count;

  const pageTitle = page === 'orders'
    ? 'Orders'
    : page === 'services'
      ? 'Service desk'
      : page === 'dealers'
        ? 'Dealer requests'
        : 'Customers';

  const currentError = page === 'orders'
    ? ordersError
    : page === 'services'
      ? servicesError
      : usersError;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">C</div>
          <div>
            <h2>califnco</h2>
            <span>ADMIN CONSOLE</span>
          </div>
        </div>

        <div className="nav-label">WORKSPACE</div>

        <button
          className={`nav-item ${page === 'orders' ? 'active' : ''}`}
          onClick={() => setPage('orders')}
          title="Orders"
          aria-label="Orders"
        >
          <span>▤</span> Orders <b>{orders.length}</b>
        </button>

        <button
          className={`nav-item ${page === 'services' ? 'active' : ''}`}
          onClick={() => setPage('services')}
          title="Service desk"
          aria-label="Service desk"
        >
          <span>♧</span> Service desk <b>{services.length}</b>
        </button>

        <button
          className={`nav-item ${page === 'dealers' ? 'active' : ''}`}
          onClick={() => setPage('dealers')}
          title="Dealer requests"
          aria-label="Dealer requests"
        >
          <span>♙</span> Dealer requests
          <b>{dealers.filter((dealer) => accountRole(dealer) === 'Pending Dealer').length}</b>
        </button>

        <button
          className={`nav-item ${page === 'customers' ? 'active' : ''}`}
          onClick={() => setPage('customers')}
          title="Customers"
          aria-label="Customers"
        >
          <span>♧</span> Customers <b>{customers.length}</b>
        </button>

        <div className="sidebar-bottom">
          <div className="admin-avatar">A</div>
          <div className="admin-info">
            <strong>Administrator</strong>
            <span>Califnco team</span>
          </div>
          <span className="online-dot" />
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> {pageTitle}
          </div>
          <div className="topbar-right">
            <span className="live-dot" /> Live database
            <div className="top-avatar">A</div>
          </div>
        </header>

        <div className="content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">CALIFNCO OPERATIONS</p>
              <h1>
                {page === 'orders' ? 'Orders overview' :
                  page === 'services' ? 'Service desk' :
                    page === 'dealers' ? 'Dealer requests' : 'Customers'}
              </h1>
              <p className="subtitle">
                {page === 'orders'
                  ? 'Track customer purchases and manage fulfilment.'
                  : page === 'services'
                    ? 'Review and update customer service requests.'
                    : page === 'dealers'
                      ? 'Approve or reject dealer applications.'
                      : 'View customer profiles and dealer account roles.'}
              </p>
            </div>
            <div className="date-chip">● Connected to Firebase</div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-top">
                <span>Total orders</span><span className="stat-icon blue">▤</span>
              </div>
              <div className="stat-value">{orders.length}</div>
              <div className="stat-note">All recorded orders</div>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>Pending orders</span><span className="stat-icon amber">◷</span>
              </div>
              <div className="stat-value">
                {orders.filter((order) =>
                  !['Delivered', 'Cancelled'].includes(orderStatus(order))
                ).length}
              </div>
              <div className="stat-note">Awaiting completion</div>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>Service requests</span><span className="stat-icon violet">♧</span>
              </div>
              <div className="stat-value">{services.length}</div>
              <div className="stat-note">Customer service cases</div>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>Order value</span><span className="stat-icon green">₹</span>
              </div>
              <div className="stat-value">
                {money(orders.reduce((sum, order) => sum + Number(orderTotal(order) || 0), 0))}
              </div>
              <div className="stat-note">Combined recorded total</div>
            </div>
          </div>

          {currentError && <div className="error-banner">{currentError}</div>}

          {page === 'orders' && (
            <section className="panel">
              <div className="panel-heading">
                <div>
                  <h2>Customer orders</h2>
                  <p>Orders from your mobile app, updated in real time.</p>
                </div>
                <span className="count-pill">{orders.length} orders</span>
              </div>

              {ordersLoading ? <div className="empty">Loading orders…</div> :
                ordersError ? <div className="empty">Orders could not be loaded.</div> :
                  orders.length === 0 ? (
                    <div className="empty">
                      <div className="empty-icon">▤</div>
                      <h3>No orders yet</h3>
                      <p>Place a test order in the mobile app to see it here.</p>
                    </div>
                  ) : (
                    <div className="table-wrap">
                      <table className="orders-table">
                        <thead>
                          <tr>
                            <th>ORDER</th><th>CUSTOMER</th><th>PHONE</th>
                            <th>DELIVERY ADDRESS</th><th>DATE</th><th>PRODUCTS</th>
                            <th>AMOUNT</th><th>STATUS</th><th>UPDATE STATUS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((order) => {
                            const customer = usersById.get(order.userId);
                            const items = orderItems(order);
                            return (
                              <tr key={order.id}>
                                <td>
                                  <strong>#{order.id}</strong>
                                  <small>
                                    {order.itemCount ?? (
                                      items.reduce(
                                        (count, item) => count + Number(productQuantity(item) || 0),
                                        0
                                      ) || 'Item count not provided'
                                    )} total units
                                  </small>
                                </td>
                                <td>
                                  {profileValue(
                                    customer?.name || customer?.fullName ||
                                    order.name || order.customerName
                                  )}
                                  <small>{profileValue(customer?.email || order.userEmail)}</small>
                                  <small>Role: {order.userRole || customer?.role || 'Not provided'}</small>
                                </td>
                                <td>{profileValue(customer?.phone || customer?.phoneNumber || order.phone)}</td>
                                <td className="address-cell">
                                  {profileValue(
                                    customer?.address || customer?.deliveryAddress || order.address
                                  )}
                                </td>
                                <td>{date(order.createdAt)}</td>
                                <td>
                                  {items.length ? (
                                    <ul className="order-products">
                                      {items.map((item, index) => (
                                        <li key={item?.id || item?.productId || index}>
                                          {item?.imageUrl && (
                                            <img
                                              className="order-product-image"
                                              src={item.imageUrl}
                                              alt=""
                                            />
                                          )}
                                          <span className="order-product-info">
                                            {productLabel(item)} × {productQuantity(item) ?? 'Not provided'}
                                            <small>{item?.productId || item?.id || 'Product ID not provided'}</small>
                                            <small>
                                              {item?.unitPrice != null || item?.price != null
                                                ? `${money(item.unitPrice ?? item.price)} each`
                                                : 'Unit price not provided'}
                                            </small>
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : 'No products provided'}
                                </td>
                                <td>
                                  <strong>
                                    {orderTotal(order) == null
                                      ? 'Not provided'
                                      : money(orderTotal(order))}
                                  </strong>
                                </td>
                                <td>
                                  <span className={`status ${orderStatus(order).toLowerCase()}`}>
                                    {orderStatus(order)}
                                  </span>
                                </td>
                                <td>
                                  <select
                                    value={orderStatus(order)}
                                    onChange={(event) => changeOrderStatus(order.id, event.target.value)}
                                    aria-label={`Update order ${order.id} status`}
                                  >
                                    <option>Pending</option>
                                    <option>Confirmed</option>
                                    <option>Processing</option>
                                    <option>Shipped</option>
                                    <option>Delivered</option>
                                    <option>Cancelled</option>
                                  </select>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
            </section>
          )}

          {page === 'services' && (
            <section className="panel">
              <div className="panel-heading">
                <div>
                  <h2>Service requests</h2>
                  <p>Manage installation, repair and maintenance bookings.</p>
                </div>
                <span className="count-pill">{services.length} requests</span>
              </div>

              {servicesLoading ? <div className="empty">Loading service requests…</div> :
                servicesError ? <div className="empty">Service requests could not be loaded.</div> :
                  services.length === 0 ? (
                    <div className="empty">
                      <div className="empty-icon">♧</div>
                      <h3>No service requests yet</h3>
                      <p>Requests from the mobile app will appear here.</p>
                    </div>
                  ) : (
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>REQUEST</th><th>CUSTOMER</th><th>PHONE</th><th>ADDRESS</th>
                            <th>SERVICE DETAILS</th><th>REQUESTED TIME</th>
                            <th>SUBMITTED</th><th>STATUS</th><th>UPDATE</th>
                          </tr>
                        </thead>
                        <tbody>
                          {services.map((item) => (
                            <tr key={item.id}>
                              <td><strong>#{item.id.slice(0, 7).toUpperCase()}</strong></td>
                              <td>
                                {item.name || item.customerName || 'Not provided'}
                                <small>{item.email || 'Not provided'}</small>
                                <small>User ID: {item.userId || 'Not provided'}</small>
                              </td>
                              <td>{profileValue(item.phone)}</td>
                              <td className="address-cell">{profileValue(item.address || item.serviceAddress)}</td>
                              <td>
                                {item.serviceType || item.type || 'Not provided'}
                                <small>{item.description || item.issueDetails || item.message || 'No issue details provided'}</small>
                              </td>
                              <td>{date(item.requestedDateTime || item.requestedAt || item.requestedDate)}</td>
                              <td>{date(item.createdAt)}</td>
                              <td><span className="status">{item.status || 'Pending'}</span></td>
                              <td>
                                <select
                                  value={item.status || 'Pending'}
                                  onChange={(event) => changeServiceStatus(item.id, event.target.value)}
                                >
                                  <option>Pending</option>
                                  <option>Scheduled</option>
                                  <option>In Progress</option>
                                  <option>Completed</option>
                                  <option>Cancelled</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
            </section>
          )}

          {page === 'dealers' && (
            <section className="panel">
              <div className="panel-heading">
                <div>
                  <h2>Dealer applications</h2>
                  <p>Approve or reject dealer registrations.</p>
                </div>
                <span className="count-pill">
                  {dealers.filter((dealer) => accountRole(dealer) === 'Pending Dealer').length} pending
                </span>
              </div>

              {usersLoading ? <div className="empty">Loading dealer applications…</div> :
                usersError ? <div className="empty">Dealer applications could not be loaded.</div> :
                  dealers.length === 0 ? (
                    <div className="empty">
                      <h3>No dealer applications</h3>
                      <p>New dealer registrations will appear here.</p>
                    </div>
                  ) : (
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr><th>EMAIL</th><th>STATUS</th><th>ACTION</th></tr>
                        </thead>
                        <tbody>
                          {dealers.map((dealer) => (
                            <tr key={dealer.id}>
                              <td>{profileValue(dealer.email)}</td>
                              <td>{accountRole(dealer)}</td>
                              <td>
                                {accountRole(dealer) === 'Pending Dealer' ? (
                                  <>
                                    <button onClick={() => changeDealerStatus(dealer.id, 'Dealer')}>
                                      Approve
                                    </button>{' '}
                                    <button onClick={() => changeDealerStatus(dealer.id, 'Rejected Dealer')}>
                                      Reject
                                    </button>
                                  </>
                                ) : 'No action needed'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
            </section>
          )}

          {page === 'customers' && (
            <section className="panel">
              <div className="panel-heading customers-heading">
                <div>
                  <h2>Customer profiles</h2>
                  <p>Profiles update live when users save changes in the mobile app.</p>
                </div>
                <label className="role-filter">
                  <span>Account type</span>
                  <select
                    value={customerRoleFilter}
                    onChange={(event) => setCustomerRoleFilter(event.target.value)}
                  >
                    {accountRoles.map((role) => <option key={role}>{role}</option>)}
                  </select>
                </label>
                <span className="count-pill">{filteredUsers.length} accounts</span>
              </div>

              {usersLoading ? <div className="empty">Loading customer profiles…</div> :
                usersError ? <div className="empty">Customer profiles could not be loaded.</div> :
                  filteredUsers.length === 0 ? (
                    <div className="empty">
                      <h3>No accounts found</h3>
                      <p>No user profiles match the selected account type.</p>
                    </div>
                  ) : (
                    <div className="table-wrap">
                      <table className="customers-table">
                        <thead>
                          <tr>
                            <th>NAME</th><th>EMAIL</th><th>PHONE</th>
                            <th>DELIVERY ADDRESS</th><th>ACCOUNT ROLE</th><th>REGISTERED</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map((user) => {
                            const role = accountRole(user);
                            return (
                              <tr key={user.id}>
                                <td>{profileValue(user.name || user.fullName)}</td>
                                <td>{profileValue(user.email)}</td>
                                <td>{profileValue(user.phone || user.phoneNumber)}</td>
                                <td className="address-cell">
                                  {profileValue(user.address || user.deliveryAddress)}
                                </td>
                                <td><span className={`role-badge ${roleClass(role)}`}>{role}</span></td>
                                <td>{date(user.createdAt || user.registeredAt || user.registrationDate)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
            </section>
          )}

          <footer>
            © 2026 Califnco · Admin operations
            <span>Built with React + Firebase</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

function accountRole(user) {
  const role = String(user?.role || '').trim().toLowerCase().replace(/[_-]+/g, ' ');
  const knownRole = dealerRoles.find((known) => known.toLowerCase() === role);
  return knownRole || 'Customer';
}

function roleClass(role) {
  return role.toLowerCase().replace(/\s+/g, '-');
}

export default App;
