import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import {
createUserWithEmailAndPassword,
onAuthStateChanged,
signInWithEmailAndPassword,
signOut,
} from 'firebase/auth';
import { auth, db } from './firebase';

const COLORS = {
  navy: '#073B4C',
  teal: '#087F8C',
  tealDark: '#05636D',
  background: '#F4F7F9',
  white: '#FFFFFF',
  text: '#172B35',
  muted: '#647680',
  border: '#DDE6EA',
  paleTeal: '#E5F5F5',
  paleBlue: '#EAF3F7',
  orange: '#F4A261',
  danger: '#B42318',
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.navy,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  header: {
    height: 70,
    backgroundColor: COLORS.navy,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 12,
  },
  headerIconButton: {
    width: 36,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerMenuIcon: {
    color: COLORS.white,
    fontSize: 27,
  },
  brandBlock: {
    flex: 1,
  },
  brandName: {
    color: COLORS.white,
    fontSize: 23,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  brandTagline: {
    color: '#C4E6E9',
    fontSize: 9,
    letterSpacing: 1.2,
    marginTop: 1,
  },
  headerProfileButton: {
    minWidth: 64,
    height: 45,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  headerProfileButtonText: {
    color: COLORS.navy,
    fontSize: 13,
    fontWeight: '800',
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: COLORS.orange,
    borderWidth: 1,
    borderColor: COLORS.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: COLORS.navy,
    fontSize: 10,
    fontWeight: '800',
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  hero: {
    backgroundColor: COLORS.navy,
    padding: 22,
    borderRadius: 20,
    marginBottom: 25,
  },
  heroEyebrow: {
    color: '#9DE0E3',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.3,
    marginBottom: 12,
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: 27,
    fontWeight: '800',
    lineHeight: 34,
  },
  heroText: {
    color: '#D7E8EC',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 9,
  },
  heroButton: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.orange,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 11,
    marginTop: 19,
  },
  heroButtonText: {
    color: COLORS.navy,
    fontWeight: '800',
    fontSize: 13,
  },
  sectionHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
  },
  pageTitle: {
    color: COLORS.text,
    fontSize: 25,
    fontWeight: '800',
    marginBottom: 6,
  },
  mutedText: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  linkText: {
    color: COLORS.teal,
    fontWeight: '800',
    fontSize: 13,
  },
  loader: {
    marginVertical: 35,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 13,
    marginTop: 15,
    marginBottom: 20,
  },
  productCard: {
    width: '48.5%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    marginBottom: 1,
  },
  productImageBox: {
    height: 125,
    borderRadius: 12,
    backgroundColor: '#F2F7F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productEmoji: {
    fontSize: 51,
  },
  productEmojiSmall: {
    fontSize: 26,
  },
  productCategory: {
    color: COLORS.teal,
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 5,
  },
  productName: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '800',
    minHeight: 38,
  },
  productDescription: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 5,
    minHeight: 30,
  },
  productPrice: {
    color: COLORS.navy,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 9,
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: COLORS.teal,
    paddingVertical: 11,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 5,
  },
  quantityButton: {
    width: 31,
    height: 31,
    borderRadius: 9,
    backgroundColor: COLORS.paleTeal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    color: COLORS.tealDark,
    fontSize: 21,
    fontWeight: '700',
    lineHeight: 24,
  },
  quantityValue: {
    minWidth: 15,
    textAlign: 'center',
    color: COLORS.text,
    fontWeight: '800',
    fontSize: 14,
  },
  warningText: {
    color: COLORS.danger,
    fontSize: 12,
    lineHeight: 18,
    marginVertical: 10,
  },
  serviceBanner: {
    backgroundColor: COLORS.paleBlue,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D4E8EE',
    padding: 18,
    marginTop: 4,
    marginBottom: 15,
  },
  serviceBannerTitle: {
    color: COLORS.navy,
    fontSize: 17,
    fontWeight: '800',
  },
  serviceBannerText: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    marginVertical: 8,
  },
  emptyState: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 25,
    alignItems: 'center',
    marginTop: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyEmoji: {
    fontSize: 43,
    marginBottom: 10,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  cartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginTop: 12,
    gap: 10,
  },
  cartProductIcon: {
    width: 53,
    height: 58,
    borderRadius: 12,
    backgroundColor: COLORS.paleBlue,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cartProductImage: {
    width: '100%',
    height: '100%',
  },
  cartProductInfo: {
    flex: 1,
  },
  cartProductName: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
  },
  cartLineTotal: {
    color: COLORS.navy,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 3,
  },
  totalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 17,
    marginTop: 18,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },
  totalValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  totalLabel: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '800',
  },
  totalAmount: {
    color: COLORS.navy,
    fontSize: 22,
    fontWeight: '800',
  },
  checkoutButton: {
    backgroundColor: COLORS.teal,
    paddingVertical: 15,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 17,
  },
  checkoutButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },
  disabledButton: {
    opacity: 0.6,
  },
  refreshButton: {
    padding: 8,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 15,
    marginTop: 13,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 10,
  },
  orderIdLabel: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  orderId: {
    color: COLORS.navy,
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadge: {
    backgroundColor: '#FFF0D9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    color: '#80500B',
    fontSize: 11,
    fontWeight: '800',
  },
  orderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  orderItemImage: {
    width: 34,
    height: 34,
    borderRadius: 6,
    backgroundColor: COLORS.paleBlue,
  },
  orderItem: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 20,
  },
  orderFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 10,
    paddingTop: 12,
  },
  orderTotal: {
    color: COLORS.navy,
    fontSize: 17,
    fontWeight: '800',
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginTop: 18,
  },
  inputLabel: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 7,
    marginTop: 9,
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FAFCFD',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.text,
    fontSize: 14,
  },
  addressInput: {
    minHeight: 85,
    textAlignVertical: 'top',
  },
  serviceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginBottom: 7,
  },
  serviceOption: {
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  serviceOptionSelected: {
    backgroundColor: COLORS.paleTeal,
    borderColor: COLORS.teal,
  },
  serviceOptionText: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  serviceOptionTextSelected: {
    color: COLORS.tealDark,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    alignItems: 'center',
    padding: 23,
    marginTop: 15,
    marginBottom: 16,
  },
  profileAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  profileAvatarText: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: '800',
  },
  profileTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  profileNote: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 12,
  },
  bottomNav: {
    minHeight: 64,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 5,
    paddingTop: 6,
    paddingBottom: 5,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  bottomNavIcon: {
    color: COLORS.muted,
    fontSize: 22,
    fontWeight: '700',
  },
  bottomNavIconContainer: {
    minWidth: 28,
    alignItems: 'center',
    position: 'relative',
  },
  bottomNavCartBadge: {
    top: -6,
    right: -12,
    borderColor: COLORS.white,
  },
  bottomNavLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: '600',
  },
  bottomNavActive: {
    color: COLORS.teal,
    fontWeight: '900',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 24,
    paddingTop: 18,
    paddingBottom: 8,
    alignItems: 'center',
    gap: 5,
  },
  footerBrand: {
    color: COLORS.navy,
    fontSize: 17,
    fontWeight: '900',
  },
  footerText: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
  },
  drawerOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: 100,
    elevation: 20,
  },
  drawerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  drawer: {
    width: '80%',
    maxWidth: 330,
    height: '100%',
    backgroundColor: COLORS.white,
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 20,
    elevation: 12,
  },
  drawerHeader: {
    backgroundColor: COLORS.navy,
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
  },
  drawerBrand: {
    color: COLORS.white,
    fontSize: 25,
    fontWeight: '900',
  },
  drawerSubtitle: {
    color: '#C4E6E9',
    fontSize: 12,
    marginTop: 4,
  },
  drawerClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerCloseText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  drawerSectionLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginBottom: 10,
    marginLeft: 7,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 13,
    borderRadius: 11,
    marginBottom: 4,
  },
  drawerItemActive: {
    backgroundColor: COLORS.paleTeal,
  },
  drawerItemIcon: {
    width: 31,
    color: COLORS.teal,
    fontSize: 19,
    fontWeight: '800',
  },
  drawerItemText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  drawerItemTextActive: {
    color: COLORS.tealDark,
    fontWeight: '800',
  },
  drawerInfo: {
    marginTop: 'auto',
    backgroundColor: COLORS.paleBlue,
    borderRadius: 12,
    padding: 13,
  },
  drawerInfoTitle: {
    color: COLORS.navy,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 5,
  },
  drawerInfoText: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
  },
});

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState('login');
  const [loginRole, setLoginRole] = useState('Customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [screen, setScreen] = useState('Home');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productError, setProductError] = useState('');
  const [cart, setCart] = useState({});
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [servicePhone, setServicePhone] = useState('');
  const [serviceType, setServiceType] = useState('General Service');
  const [serviceAddress, setServiceAddress] = useState('');
  const [serviceSaving, setServiceSaving] = useState(false);
  const [orderSaving, setOrderSaving] = useState(false);
  const orderSavingRef = useRef(false);
  const serviceSavingRef = useRef(false);
  const [lastServiceRequestId, setLastServiceRequestId] = useState('');
  const [lastServiceStatus, setLastServiceStatus] = useState('Pending');
    useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setUserRole(null);
        setProfileName('');
        setProfilePhone('');
        setProfileAddress('');
        setProfileError('');
        setProfileLoading(false);
        setAuthLoading(false);
        return;
      }

      setAuthLoading(true);
      setProfileLoading(true);
      setProfileError('');
      try {
        const snapshot = await getDoc(doc(db, 'users', currentUser.uid));
        if (auth.currentUser?.uid !== currentUser.uid) {
          return;
        }

        const profile = snapshot.exists() ? snapshot.data() : {};
        setUserRole(profile.role || 'Customer');
        setProfileName(profile.name || profile.fullName || '');
        setProfilePhone(profile.phone || profile.phoneNumber || '');
        setProfileAddress(profile.address || profile.deliveryAddress || '');
      } catch (error) {
        console.error('Unable to load user profile:', error);
        if (auth.currentUser?.uid === currentUser.uid) {
          setUserRole('Customer');
          setProfileName('');
          setProfilePhone('');
          setProfileAddress('');
          setProfileError('Your saved profile could not be loaded. You can still update and save it.');
        }
      } finally {
        if (auth.currentUser?.uid === currentUser.uid) {
          setProfileLoading(false);
          setAuthLoading(false);
        }
      }
    });

    return unsubscribe;
  }, []);
  const navigate = (nextScreen) => {
    setScreen(nextScreen);
    setDrawerOpen(false);
    if (nextScreen === 'Orders') {
      loadOrders();
    }
  };

  useEffect(() => {
    let isCurrent = true;

    const fetchProducts = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'products'));
        if (isCurrent) {
          setProducts(snapshot.docs.map((productDoc) => ({
            id: productDoc.id,
            ...productDoc.data(),
          })));
        }
      } catch (error) {
        console.error('Unable to load products:', error);
        if (isCurrent) {
          setProductError('Products could not be loaded. Please try again later.');
        }
      } finally {
        if (isCurrent) {
          setLoading(false);
        }
      }
    };

    fetchProducts();
    return () => {
      isCurrent = false;
    };
  }, []);


const loadOrders = async () => {
  if (!user) {
    setOrders([]);
    setOrdersError('');
    return;
  }

  setOrdersLoading(true);
  setOrdersError('');

  try {
    const snapshot = await getDocs(
      query(collection(db, 'orders'), where('userId', '==', user.uid))
    );

    const loadedOrders = snapshot.docs
      .map((orderDoc) => ({
        id: orderDoc.id,
        ...orderDoc.data(),
      }))
      .filter((order) => order.userId === user.uid);

    loadedOrders.sort((first, second) => {
      const firstTime = first.createdAt?.toMillis?.() || 0;
      const secondTime = second.createdAt?.toMillis?.() || 0;
      return secondTime - firstTime;
    });

    setOrders(loadedOrders);
  } catch (error) {
    console.error('Unable to load orders:', error);
    setOrdersError('Orders could not be loaded. Please try again.');
  } finally {
    setOrdersLoading(false);
  }
};


  useEffect(() => {
    if (!lastServiceRequestId) {
      return undefined;
    }

    return onSnapshot(
      doc(db, 'serviceRequests', lastServiceRequestId),
      (snapshot) => {
        if (snapshot.exists()) {
          setLastServiceStatus(snapshot.data().status || 'Pending');
        }
      },
      (error) => {
        console.error('Unable to listen for service request updates:', error);
        Alert.alert(
          'Status unavailable',
          'Your service request was submitted, but its latest status could not be loaded.',
        );
      },
    );
  }, [lastServiceRequestId]);

  const cartItems = useMemo(
    () => Object.entries(cart)
      .map(([productId, quantity]) => ({
        product: products.find((item) => item.id === productId),
        quantity,
      }))
      .filter((item) => item.product),
    [cart, products],
  );
  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  

const MIN_DEALER_QUANTITY = 5;
const isDealerOrderBelowMinimum =
  userRole === 'Dealer' && itemCount < MIN_DEALER_QUANTITY;

const getProductPrice = (product) => {
  const qualifiesForWholesale =
    userRole === 'Dealer' &&
    itemCount >= MIN_DEALER_QUANTITY;
  const rawPrice = qualifiesForWholesale
    ? product.dealerPrice ?? product.price
    : product.price;
  return rawPrice == null || rawPrice === '' ? Number.NaN : Number(rawPrice);
};


const total = cartItems.reduce(
  (sum, item) =>
    sum + getProductPrice(item.product) * item.quantity,
  0,
);


  const formatMoney = (amount) =>
    `₹${Number(amount || 0).toLocaleString('en-IN')}`;

  const changeQuantity = (productId, change) => {
    setCart((currentCart) => {
      const nextQuantity = (currentCart[productId] || 0) + change;
      if (nextQuantity <= 0) {
        const { [productId]: removed, ...remaining } = currentCart;
        return remaining;
      }
      return { ...currentCart, [productId]: nextQuantity };
    });
  };

  const renderProduct = (product) => {
    const productName = product.name || product.title || 'Water Purifier Product';
    const quantity = cart[product.id] || 0;
    return (
      <View key={product.id} style={styles.productCard}>
        <View style={styles.productImageBox}>
          {product.imageUrl ? (
            <Image
              source={{ uri: product.imageUrl }}
              style={styles.productImage}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.productEmoji}>💧</Text>
          )}
        </View>
        {product.category ? (
          <Text style={styles.productCategory}>{product.category}</Text>
        ) : null}
        <Text style={styles.productName}>{productName}</Text>
        {product.description ? (
          <Text style={styles.productDescription} numberOfLines={2}>
            {product.description}
          </Text>
        ) : null}
        <Text style={styles.productPrice}>
  {formatMoney(getProductPrice(product))}
</Text>
        {quantity > 0 ? (
          <View style={styles.quantityControl}>
            <Pressable
              accessibilityLabel={`Remove one ${productName} from cart`}
              style={styles.quantityButton}
              onPress={() => changeQuantity(product.id, -1)}
            >
              <Text style={styles.quantityButtonText}>−</Text>
            </Pressable>
            <Text style={styles.quantityValue}>{quantity}</Text>
            <Pressable
              accessibilityLabel={`Add one ${productName} to cart`}
              style={styles.quantityButton}
              onPress={() => changeQuantity(product.id, 1)}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={styles.primaryButton}
            onPress={() => changeQuantity(product.id, 1)}
          >
            <Text style={styles.primaryButtonText}>Add to Cart</Text>
          </Pressable>
        )}
      </View>
    );
  };


const checkout = async () => {
  if (orderSavingRef.current) {
    return;
  }

  if (cartItems.length === 0) {
    return;
  }

  if (isDealerOrderBelowMinimum) {
    Alert.alert(
      'Minimum order not met',
      `Dealer orders require at least ${MIN_DEALER_QUANTITY} items. Add ${MIN_DEALER_QUANTITY - itemCount} more item(s) to continue.`
    );
    return;
  }

  if (!user) {
    Alert.alert(
      'Login required',
      'Please sign in to place your order.',
      [
        {
          text: 'OK',
          onPress: () => setScreen('Profile'),
        },
      ]
    );
    return;
  }

  const orderName = profileName.trim();
  const orderPhone = profilePhone.trim();
  const orderAddress = profileAddress.trim();
  if (!orderName || !orderPhone || !orderAddress) {
    Alert.alert(
      'Complete your profile',
      'Add your name, phone number, and delivery address before placing an order.',
      [{ text: 'Update profile', onPress: () => setScreen('Profile') }]
    );
    return;
  }

  const orderItems = cartItems.map(({ product, quantity }) => {
    const unitPrice = getProductPrice(product);
    return {
      productId: product.id,
      name: product.name || product.title || 'Water Purifier Product',
      unitPrice,
      quantity: Number(quantity),
      imageUrl: product.imageUrl || '',
    };
  });
  const validItems = orderItems.every((item) =>
    Number.isFinite(item.unitPrice) &&
    item.unitPrice >= 0 &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0
  );
  if (!validItems) {
    Alert.alert('Invalid cart', 'One or more product prices or quantities are invalid.');
    return;
  }

  const orderItemCount = orderItems.reduce((count, item) => count + item.quantity, 0);
  const orderTotal = orderItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  if (!Number.isFinite(orderTotal)) {
    Alert.alert('Invalid cart', 'The cart total could not be calculated.');
    return;
  }
  if (userRole === 'Dealer' && orderItemCount < MIN_DEALER_QUANTITY) {
    Alert.alert(
      'Minimum order not met',
      `Dealer orders require at least ${MIN_DEALER_QUANTITY} items.`
    );
    return;
  }

  orderSavingRef.current = true;
  setOrderSaving(true);
  try {
    const orderRef = await addDoc(collection(db, 'orders'), {
      userId: user.uid,
      userEmail: user.email || '',
      userRole: userRole || 'Customer',
      name: orderName,
      phone: orderPhone,
      address: orderAddress,
      items: orderItems,
      itemCount: orderItemCount,
      total: orderTotal,
      status: 'Pending',
      createdAt: serverTimestamp(),
    });

    setCart({});
    try {
      const savedOrder = await getDoc(orderRef);
      if (!savedOrder.exists()) {
        throw new Error('Order document was not found after write.');
      }
    } catch (readError) {
      console.error('Order saved but read-back failed:', readError);
      Alert.alert(
        'Order saved',
        `Your order ${orderRef.id} was saved, but could not be read back just now. Do not submit it again.`
      );
      return;
    }

    Alert.alert('Order placed', `Your order reference is ${orderRef.id}.`);
  } catch (error) {
    console.error('Unable to place order:', error);
    Alert.alert(
      'Order failed',
      'Your order could not be placed. Please try again.'
    );
  } finally {
    orderSavingRef.current = false;
    setOrderSaving(false);
  }
};


  const submitServiceRequest = async () => {
    if (serviceSavingRef.current) {
      return;
    }

    const name = serviceName.trim();
    const phone = servicePhone.trim();
    const address = serviceAddress.trim();
    if (!name || !phone || !address) {
      Alert.alert('Missing information', 'Please enter your name, phone number, and address.');
      return;
    }

    if (!user) {
      Alert.alert('Login required', 'Please sign in before submitting a service request.');
      return;
    }

    if (!user.email) {
      Alert.alert('Email required', 'Your account must have an email address to submit a service request.');
      return;
    }

    serviceSavingRef.current = true;
    setServiceSaving(true);
    try {
      const requestRef = await addDoc(collection(db, 'serviceRequests'), {
        userId: user.uid,
        name,
        email: user.email,
        phone,
        serviceType,
        address,
        status: 'Pending',
        createdAt: serverTimestamp(),
      });
      setLastServiceRequestId(requestRef.id);
      setLastServiceStatus('Pending');
      setServiceName('');
      setServicePhone('');
      setServiceAddress('');
      try {
        const savedRequest = await getDoc(requestRef);
        if (!savedRequest.exists()) {
          throw new Error('Service request was not found after write.');
        }
      } catch (readError) {
        console.error('Service request saved but read-back failed:', readError);
        Alert.alert(
          'Request saved',
          `Your request ${requestRef.id} was saved, but could not be read back just now. Do not submit it again.`
        );
        return;
      }
      Alert.alert('Request submitted', `Your reference is ${requestRef.id}.`);
    } catch (error) {
      console.error('Unable to submit service request:', error);
      Alert.alert(
        'Submission failed',
        'Your service request could not be submitted. Please try again.',
      );
    } finally {
      serviceSavingRef.current = false;
      setServiceSaving(false);
    }
  };

  const renderHome = () => (
    <>
      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>CALIFNCO WATER SOLUTIONS</Text>
        <Text style={styles.heroTitle}>Pure water. Better living.</Text>
        <Text style={styles.heroText}>
          Discover water purifiers and essential accessories for your home.
        </Text>
        <Pressable
          style={styles.heroButton}
          onPress={() => navigate('Products')}
        >
          <Text style={styles.heroButtonText}>Explore Products →</Text>
        </Pressable>
      </View>

      <View style={styles.sectionHeading}>
        <View>
          <Text style={styles.sectionTitle}>Popular Products</Text>
          <Text style={styles.mutedText}>Quality solutions for your home</Text>
        </View>
        <Pressable onPress={() => navigate('Products')}>
          <Text style={styles.linkText}>View all</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={COLORS.teal}
          style={styles.loader}
        />
      ) : (
        <View style={styles.productGrid}>
          {products.slice(0, 4).map(renderProduct)}
        </View>
      )}

      {productError ? (
        <Text style={styles.warningText}>{productError}</Text>
      ) : null}

      <Pressable
        style={styles.serviceBanner}
        onPress={() => navigate('Service')}
      >
        <Text style={styles.serviceBannerTitle}>Need purifier servicing?</Text>
        <Text style={styles.serviceBannerText}>
          Book maintenance, filter replacement or repair.
        </Text>
        <Text style={styles.linkText}>Book a Service →</Text>
      </Pressable>
    </>
  );

  const renderProducts = () => (
    <>
      <Text style={styles.pageTitle}>Our Products</Text>
      <Text style={styles.mutedText}>
        Browse water purifiers and accessories.
      </Text>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={COLORS.teal}
          style={styles.loader}
        />
      ) : (
        <View style={styles.productGrid}>
          {products.map(renderProduct)}
        </View>
      )}

      {productError ? (
        <Text style={styles.warningText}>{productError}</Text>
      ) : null}
    </>
  );

  const renderCart = () => (
    <>
      <Text style={styles.pageTitle}>Your Cart</Text>
      <Text style={styles.mutedText}>
        {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
      </Text>

      {cartItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.mutedText}>Add a product to get started.</Text>
          <Pressable
            style={styles.primaryButton}
            onPress={() => navigate('Products')}
          >
            <Text style={styles.primaryButtonText}>Browse Products</Text>
          </Pressable>
        </View>
      ) : (
        <>

{userRole === 'Dealer' && (
  <Text style={styles.productDescription}>
    {itemCount >= MIN_DEALER_QUANTITY
      ? 'Minimum order quantity met. Dealer wholesale pricing applied!'
      : `Dealer orders require at least ${MIN_DEALER_QUANTITY} items. Add ${MIN_DEALER_QUANTITY - itemCount} more item(s) to continue.`}
  </Text>
)}

{cartItems.map(({ product, quantity }) => (
  <View key={product.id} style={styles.cartRow}>
    {/* Keep your existing cart product code here */}
  </View>
))}

          {cartItems.map(({ product, quantity }) => (
            <View key={product.id} style={styles.cartRow}>
              <View style={styles.cartProductIcon}>
                {product.imageUrl ? (
                  <Image
                    source={{ uri: product.imageUrl }}
                    style={styles.cartProductImage}
                    resizeMode="contain"
                  />
                ) : (
                  <Text style={styles.productEmojiSmall}>💧</Text>
                )}
              </View>

              <View style={styles.cartProductInfo}>
                <Text style={styles.cartProductName}>
                  {product.name || product.title || 'Water Purifier Product'}
                </Text>
                <Text style={styles.mutedText}>
                  {formatMoney(getProductPrice(product))} each
                </Text>
                <Text style={styles.cartLineTotal}>
                 {formatMoney(getProductPrice(product) * quantity)}
                </Text>
              </View>

              <View style={styles.quantityControl}>
                <Pressable
                  style={styles.quantityButton}
                  onPress={() => changeQuantity(product.id, -1)}
                >
                  <Text style={styles.quantityButtonText}>−</Text>
                </Pressable>
                <Text style={styles.quantityValue}>{quantity}</Text>
                <Pressable
                  style={styles.quantityButton}
                  onPress={() => changeQuantity(product.id, 1)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </Pressable>
              </View>
            </View>
          ))}

          <View style={styles.totalCard}>
            <View style={styles.totalRow}>
              <Text style={styles.mutedText}>Items</Text>
              <Text style={styles.totalValue}>{itemCount}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>{formatMoney(total)}</Text>
            </View>
            <Text style={styles.mutedText}>
              Final delivery charges, if applicable, are not included.
            </Text>
            <Pressable
              accessibilityState={{
                disabled: isDealerOrderBelowMinimum || orderSaving,
              }}
              disabled={isDealerOrderBelowMinimum || orderSaving}
              style={[
                styles.checkoutButton,
                isDealerOrderBelowMinimum || orderSaving ? styles.disabledButton : null,
              ]}
              onPress={checkout}
            >
              <Text style={styles.checkoutButtonText}>
                {orderSaving ? 'Placing Order...' : `Place Order · ${formatMoney(total)}`}
              </Text>
            </Pressable>
          </View>
        </>
      )}
    </>
  );

  const renderOrders = () => (
    <>
      <View style={styles.sectionHeading}>
        <View>
          <Text style={styles.pageTitle}>My Orders</Text>
          <Text style={styles.mutedText}>Your saved order history</Text>
        </View>
        <Pressable onPress={loadOrders} style={styles.refreshButton}>
          <Text style={styles.linkText}>Refresh</Text>
        </Pressable>
      </View>

      {ordersLoading ? (
        <ActivityIndicator
          size="large"
          color={COLORS.teal}
          style={styles.loader}
        />
      ) : ordersError ? (
        <View style={styles.emptyState}>
          <Text style={styles.warningText}>{ordersError}</Text>
          <Pressable style={styles.primaryButton} onPress={loadOrders}>
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </Pressable>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📦</Text>
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.mutedText}>
            Orders you place will appear here.
          </Text>
          <Pressable
            style={styles.primaryButton}
            onPress={() => navigate('Products')}
          >
            <Text style={styles.primaryButtonText}>Explore Products</Text>
          </Pressable>
        </View>
      ) : (
        orders.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.orderIdLabel}>ORDER ID</Text>
                <Text style={styles.orderId} selectable>
                  {order.id}
                </Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {order.status || 'Pending'}
                </Text>
              </View>
            </View>

            {Array.isArray(order.items)
              ? order.items.map((item, index) => (
                  <View
                    key={`${order.id}-${index}`}
                    style={styles.orderItemRow}
                  >
                    {item.imageUrl ? (
                      <Image
                        source={{ uri: item.imageUrl }}
                        style={styles.orderItemImage}
                        resizeMode="contain"
                      />
                    ) : null}
                    <Text style={styles.orderItem}>
                      {item.name || 'Product'} × {item.quantity || 1}
                    </Text>
                  </View>
                ))
              : null}

            <View style={styles.orderFooter}>
              <Text style={styles.mutedText}>
                {order.itemCount || 0} items
              </Text>
              <Text style={styles.orderTotal}>
                {formatMoney(order.total)}
              </Text>
            </View>
          </View>
        ))
      )}
    </>
  );

    const renderService = () => (
    <>
      <Text style={styles.pageTitle}>Book a Service</Text>
      <Text style={styles.mutedText}>
        Book maintenance, filter replacement or repair for your purifier.
      </Text>

      {lastServiceRequestId ? (
        <View style={styles.orderCard}>
          <Text style={styles.orderIdLabel}>LATEST SERVICE REQUEST</Text>
          <Text style={styles.orderId} selectable>
            Reference: {lastServiceRequestId}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { alignSelf: 'flex-start', marginTop: 12 },
            ]}
          >
            <Text style={styles.statusText}>
              {lastServiceStatus || 'Pending'}
            </Text>
          </View>
          <Text style={[styles.mutedText, { marginTop: 10 }]}>
            Your status updates automatically when our service team updates
            your request.
          </Text>
        </View>
      ) : null}

      <View style={styles.formCard}>
        <Text style={styles.inputLabel}>Your name</Text>
        <TextInput
          value={serviceName}
          onChangeText={setServiceName}
          placeholder="Enter your full name"
          style={styles.input}
          placeholderTextColor={COLORS.muted}
        />

        <Text style={styles.inputLabel}>Phone number</Text>
        <TextInput
          value={servicePhone}
          onChangeText={setServicePhone}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
          style={styles.input}
          placeholderTextColor={COLORS.muted}
        />

        <Text style={styles.inputLabel}>Service type</Text>
        <View style={styles.serviceOptions}>
          {['General Service', 'Filter Replacement', 'Repair'].map((type) => (
            <Pressable
              key={type}
              onPress={() => setServiceType(type)}
              style={[
                styles.serviceOption,
                serviceType === type && styles.serviceOptionSelected,
              ]}
            >
              <Text
                style={[
                  styles.serviceOptionText,
                  serviceType === type && styles.serviceOptionTextSelected,
                ]}
              >
                {type}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.inputLabel}>Address</Text>
        <TextInput
          value={serviceAddress}
          onChangeText={setServiceAddress}
          placeholder="Enter your service address"
          multiline
          style={[styles.input, styles.addressInput]}
          placeholderTextColor={COLORS.muted}
        />

        <Pressable
          style={[
            styles.checkoutButton,
            serviceSaving && styles.disabledButton,
          ]}
          disabled={serviceSaving}
          onPress={submitServiceRequest}
        >
          <Text style={styles.checkoutButtonText}>
            {serviceSaving ? 'Submitting...' : 'Submit Service Request'}
          </Text>
        </Pressable>
      </View>
    </>
  );
    

const handleAuth = async () => {
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail || !password) {
    Alert.alert('Missing details', 'Enter your email and password.');
    return;
  }

  if (password.length < 6) {
    Alert.alert('Password too short', 'Use at least 6 characters.');
    return;
  }

  try {
    if (authMode === 'register') {
      const credential = await createUserWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );

      await setDoc(doc(db, 'users', credential.user.uid), {
        email: cleanEmail,
        role: loginRole === 'Dealer' ? 'Pending Dealer' : 'Customer',
        createdAt: serverTimestamp(),
      }, { merge: true });
      const savedProfile = await getDoc(doc(db, 'users', credential.user.uid));
      if (!savedProfile.exists()) {
        throw new Error('User profile was not found after registration.');
      }

      if (loginRole === 'Dealer') {
        await signOut(auth);
        Alert.alert(
          'Approval pending',
          'Your dealer application is awaiting admin approval. Please wait and try again later.'
        );
      } else {
        Alert.alert(
          'Registration successful',
          'Your customer account has been created. You can now sign in.'
        );
      }

      return;
    }

    // Customers sign in normally.
    // Dealer approval is verified immediately after authentication.
    const credential = await signInWithEmailAndPassword(
      auth,
      cleanEmail,
      password
    );

    const userSnapshot = await getDoc(
      doc(db, 'users', credential.user.uid)
    );

    const role = userSnapshot.exists()
      ? userSnapshot.data().role
      : 'Customer';

    if (role === 'Pending Dealer') {
      await signOut(auth);
      Alert.alert(
        'Dealer approval pending',
        'Your dealer account is awaiting admin approval. Please wait and try again later.'
      );
      return;
    }

    if (role === 'Rejected Dealer') {
      await signOut(auth);
      Alert.alert(
        'Dealer application rejected',
        'Your application was rejected. Please contact the admin for more information.'
      );
      return;
    }

    if (role === 'Dealer') {
      setUserRole('Dealer');
    } else {
      setUserRole('Customer');
    }
  } catch (error) {
    console.error('Authentication or account registration failed:', error);
    let message = 'Please try again.';

    if (
      error.code === 'auth/invalid-credential' ||
      error.code === 'auth/wrong-password' ||
      error.code === 'auth/user-not-found'
    ) {
      message = 'Incorrect email or password. Check your details and try again.';
    } else if (error.code === 'auth/email-already-in-use') {
      message = 'An account already exists for this email. Sign in instead.';
    } else if (error.code === 'auth/operation-not-allowed') {
      message = 'Email and password sign-in is not enabled in Firebase.';
    } else if (error.code === 'auth/weak-password') {
      message = 'Choose a stronger password and try again.';
    }

    Alert.alert('Authentication failed', message);
  }
};

const saveProfile = async () => {
  const name = profileName.trim();
  const phone = profilePhone.trim();
  const address = profileAddress.trim();

  if (!user) {
    Alert.alert('Login required', 'Please sign in to save your profile.');
    return;
  }

  if (!name || !phone || !address) {
    Alert.alert(
      'Missing information',
      'Please enter your full name, phone number, and delivery address.'
    );
    return;
  }

  setProfileSaving(true);
  setProfileError('');
  try {
    const userRef = doc(db, 'users', user.uid);
    const existingProfile = await getDoc(userRef);
    const profileUpdate = {
      name,
      phone,
      address,
      updatedAt: serverTimestamp(),
    };
    if (!existingProfile.exists()) {
      profileUpdate.email = user.email || '';
      profileUpdate.role = 'Customer';
      profileUpdate.createdAt = serverTimestamp();
    }

    await setDoc(
      userRef,
      profileUpdate,
      { merge: true }
    );

    setProfileName(name);
    setProfilePhone(phone);
    setProfileAddress(address);
    let refreshedSnapshot;
    try {
      refreshedSnapshot = await getDoc(userRef);
    } catch (error) {
      console.error('Profile saved but unable to refresh it:', error);
      Alert.alert(
        'Profile saved',
        'Your details were saved, but could not be refreshed on screen.'
      );
      return;
    }

    if (refreshedSnapshot.exists()) {
      const refreshedProfile = refreshedSnapshot.data();
      setProfileName(refreshedProfile.name || refreshedProfile.fullName || '');
      setProfilePhone(refreshedProfile.phone || refreshedProfile.phoneNumber || '');
      setProfileAddress(refreshedProfile.address || refreshedProfile.deliveryAddress || '');
      setUserRole(refreshedProfile.role || userRole || 'Customer');
    }
    Alert.alert('Profile saved', 'Your profile details have been updated.');
  } catch (error) {
    console.error('Unable to save user profile:', error);
    Alert.alert(
      'Save failed',
      'Your profile could not be saved. Please try again.'
    );
  } finally {
    setProfileSaving(false);
  }
};

  const renderProfile = () => (
    <>
      <Text style={styles.pageTitle}>My Profile</Text>

      {user ? (
        authLoading || profileLoading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.teal}
            style={styles.loader}
          />
        ) : (
          <View style={styles.formCard}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>
                {(profileName || user.email || 'C').charAt(0).toUpperCase()}
              </Text>
            </View>

            <Text style={styles.mutedText}>Role: {userRole || 'Customer'}</Text>
            {userRole === 'Pending Dealer' ? (
              <Text style={styles.profileNote}>
                Your dealer account is awaiting admin approval.
              </Text>
            ) : null}

            {profileError ? (
              <Text style={styles.warningText}>{profileError}</Text>
            ) : null}

            <Text style={styles.inputLabel}>Email address</Text>
            <TextInput
              value={user.email || ''}
              editable={false}
              style={[styles.input, { opacity: 0.7 }]}
              placeholderTextColor={COLORS.muted}
              accessibilityLabel="Email address, read only"
            />

            <Text style={styles.inputLabel}>Full name</Text>
            <TextInput
              value={profileName}
              onChangeText={setProfileName}
              placeholder="Enter your full name"
              autoCapitalize="words"
              style={styles.input}
              placeholderTextColor={COLORS.muted}
              accessibilityLabel="Full name"
            />

            <Text style={styles.inputLabel}>Phone number</Text>
            <TextInput
              value={profilePhone}
              onChangeText={setProfilePhone}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              style={styles.input}
              placeholderTextColor={COLORS.muted}
              accessibilityLabel="Phone number"
            />

            <Text style={styles.inputLabel}>Delivery address</Text>
            <TextInput
              value={profileAddress}
              onChangeText={setProfileAddress}
              placeholder="Enter your delivery address"
              multiline
              style={[styles.input, styles.addressInput]}
              placeholderTextColor={COLORS.muted}
              accessibilityLabel="Delivery address"
            />

            <Pressable
              accessibilityState={{ disabled: profileSaving }}
              style={[
                styles.checkoutButton,
                profileSaving && styles.disabledButton,
              ]}
              disabled={profileSaving}
              onPress={saveProfile}
            >
              <Text style={styles.checkoutButtonText}>
                {profileSaving ? 'Saving Profile...' : 'Save Profile'}
              </Text>
            </Pressable>

            <Pressable
              style={[styles.checkoutButton, { width: '100%' }]}
              onPress={async () => {
                try {
                  await signOut(auth);
                  setPassword('');
                  setScreen('Home');
                } catch (error) {
                  console.error('Unable to sign out:', error);
                  Alert.alert('Sign out failed', 'Please try again.');
                }
              }}
            >
              <Text style={styles.checkoutButtonText}>Sign Out</Text>
            </Pressable>
          </View>
        )
      ) : (
        <View style={styles.formCard}>
          <Text style={styles.profileTitle}>
            {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
          </Text>

          {authMode === 'register' ? (
            <>
              <Text style={styles.inputLabel}>Account type</Text>
              <View style={styles.serviceOptions}>
                {['Customer', 'Dealer'].map((role) => (
                  <Pressable
                    key={role}
                    onPress={() => setLoginRole(role)}
                    style={[
                      styles.serviceOption,
                      loginRole === role && styles.serviceOptionSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.serviceOptionText,
                        loginRole === role && styles.serviceOptionTextSelected,
                      ]}
                    >
                      {role}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}

          <Text style={styles.inputLabel}>Email address</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            placeholderTextColor={COLORS.muted}
          />

          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            secureTextEntry
            style={styles.input}
            placeholderTextColor={COLORS.muted}
          />

          <Pressable style={styles.checkoutButton} onPress={handleAuth}>
            <Text style={styles.checkoutButtonText}>
              {authMode === 'login' ? 'Login' : 'Register'}
            </Text>
          </Pressable>

          <Pressable
            style={{ marginTop: 18, alignItems: 'center' }}
            onPress={() => {
              setAuthMode(authMode === 'login' ? 'register' : 'login');
            }}
          >
            <Text style={styles.linkText}>
              {authMode === 'login'
                ? 'New here? Register'
                : 'Already registered? Login'}
            </Text>
          </Pressable>

          {authMode === 'register' ? (
            <Text style={styles.profileNote}>
              Dealer registrations require admin approval before dealer access
              should be granted.
            </Text>
          ) : null}
        </View>
      )}

      <Text style={styles.mutedText}>
        Need help with your purifier? Open the menu to book a service.
      </Text>
    </>
  );

  const renderScreen = () => {
    switch (screen) {
      case 'Products':
        return renderProducts();
      case 'Cart':
        return renderCart();
      case 'Orders':
        return renderOrders();
      case 'Service':
        return renderService();
      case 'Profile':
        return renderProfile();
      case 'Home':
      default:
        return renderHome();
    }
  };

  const drawerItems = [
    { label: 'Cart', icon: '🛒' },
    { label: 'Service', icon: '⚙' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.navy}
        translucent={Platform.OS === 'android'}
      />

      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Open navigation menu"
          style={styles.headerIconButton}
          onPress={() => setDrawerOpen(true)}
        >
          <Text style={styles.headerMenuIcon}>☰</Text>
        </Pressable>

        <Pressable
          style={styles.brandBlock}
          onPress={() => navigate('Home')}
        >
          <Text style={styles.brandName}>Califnco</Text>
          <Text style={styles.brandTagline}>PURE WATER SOLUTIONS</Text>
        </Pressable>

        <Pressable
          accessibilityLabel={user ? 'Open profile' : 'Login'}
          style={styles.headerProfileButton}
          onPress={() => navigate('Profile')}
        >
          <Text style={styles.headerProfileButtonText}>
            {user ? 'Profile' : 'Login'}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {renderScreen()}
        <View style={styles.footer}>
          <Text style={styles.footerBrand}>Califnco</Text>
          <Text style={styles.footerText}>Pure water. Better living.</Text>
          <Text style={styles.footerText}>
            Product availability and service requests are subject to
            confirmation.
          </Text>
        </View>
      </ScrollView>

      {!drawerOpen ? (
        <View style={styles.bottomNav}>
          {[
            { label: 'Home', icon: '⌂' },
            { label: 'Products', icon: '▦' },
            { label: 'Orders', icon: '▤' },
            { label: 'Cart', icon: '🛒' },
          ].map((item) => {
            const active = screen === item.label;
            return (
              <Pressable
                key={item.label}
                style={styles.bottomNavItem}
                onPress={() => navigate(item.label)}
              >
                <View style={styles.bottomNavIconContainer}>
                  <Text
                    style={[
                      styles.bottomNavIcon,
                      active && styles.bottomNavActive,
                    ]}
                  >
                    {item.icon}
                  </Text>
                  {item.label === 'Cart' && itemCount > 0 ? (
                    <View style={[styles.cartBadge, styles.bottomNavCartBadge]}>
                      <Text style={styles.cartBadgeText}>
                        {itemCount > 99 ? '99+' : itemCount}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text
                  style={[
                    styles.bottomNavLabel,
                    active && styles.bottomNavActive,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {drawerOpen ? (
        <View style={styles.drawerOverlay}>
          <Pressable
            style={styles.drawerBackdrop}
            onPress={() => setDrawerOpen(false)}
          />
          <View style={styles.drawer}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerBrand}>Califnco</Text>
              <Text style={styles.drawerSubtitle}>Water Solutions</Text>
              <Pressable
                style={styles.drawerClose}
                onPress={() => setDrawerOpen(false)}
              >
                <Text style={styles.drawerCloseText}>✕</Text>
              </Pressable>
            </View>

            <Text style={styles.drawerSectionLabel}>QUICK ACCESS</Text>
            {drawerItems.map((item) => (
              <Pressable
                key={item.label}
                style={[
                  styles.drawerItem,
                  screen === item.label && styles.drawerItemActive,
                ]}
                onPress={() => navigate(item.label)}
              >
                <Text style={styles.drawerItemIcon}>{item.icon}</Text>
                <Text
                  style={[
                    styles.drawerItemText,
                    screen === item.label && styles.drawerItemTextActive,
                  ]}
                >
                  {item.label === 'Service' ? 'Book a Service' : item.label}
                </Text>
              </Pressable>
            ))}

            <View style={styles.drawerInfo}>
              <Text style={styles.drawerInfoTitle}>Need help?</Text>
              <Text style={styles.drawerInfoText}>
                Contact details can be added here before release.
              </Text>
            </View>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

export default App;
