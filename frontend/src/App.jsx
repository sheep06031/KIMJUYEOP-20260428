import { useEffect, useState } from 'react';
import './App.css';
import { checkHealth, fetchProductById, fetchProductInsights, fetchProducts } from './api';
import ChatBot from './components/ChatBot';
import ProductDetail from './components/ProductDetail';
import ProductGrid from './components/ProductGrid';

function getRouteFromHash() {
  const hash = window.location.hash || '#/';
  const path = window.location.pathname || '/';

  if (hash.startsWith('#/products/')) {
    return {
      view: 'detail',
      productId: hash.replace('#/products/', ''),
    };
  }

  if (path.startsWith('/products/')) {
    return {
      view: 'detail',
      productId: path.replace('/products/', ''),
    };
  }

  return {
    view: 'list',
    productId: null,
  };
}

function App() {
  const [products, setProducts] = useState([]);
  const [insights, setInsights] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [error, setError] = useState('');
  const [health, setHealth] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });
  const [route, setRoute] = useState(getRouteFromHash());

  useEffect(() => {
    function handleHashChange() {
      setRoute(getRouteFromHash());
    }

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  useEffect(() => {
    async function load() {
      if (route.view !== 'list') {
        return;
      }

      try {
        setListLoading(true);
        setError('');
        const [healthData, productData] = await Promise.all([
          checkHealth(),
          fetchProducts(pagination.page, pagination.limit),
        ]);
        setHealth(healthData);
        setProducts(productData.products || []);
        setInsights([]);
        setPagination((current) => ({
          ...current,
          page: productData.page || current.page,
          limit: productData.limit || current.limit,
          total: productData.total || 0,
          totalPages: productData.totalPages || 1,
        }));
      } catch (loadError) {
        setError('상품 데이터를 불러오지 못했습니다. 백엔드 실행 상태를 확인해주세요.');
      } finally {
        setListLoading(false);
      }
    }

    load();
  }, [pagination.page, pagination.limit, route.view]);

  useEffect(() => {
    async function loadInsights() {
      if (route.view !== 'list' || !products.length) {
        setInsights([]);
        setInsightsLoading(false);
        return;
      }

      try {
        setInsightsLoading(true);
        const insightData = await fetchProductInsights(pagination.page, pagination.limit);
        setInsights(insightData.insights || []);
      } catch (loadError) {
        setInsights([]);
      } finally {
        setInsightsLoading(false);
      }
    }

    loadInsights();
  }, [products, pagination.page, pagination.limit, route.view]);

  useEffect(() => {
    async function loadDetail() {
      if (route.view !== 'detail' || !route.productId) {
        setSelectedProduct(null);
        return;
      }

      try {
        setDetailLoading(true);
        setError('');
        const [healthData, product] = await Promise.all([checkHealth(), fetchProductById(route.productId)]);
        setHealth(healthData);
        setSelectedProduct(product);
      } catch (loadError) {
        setError('상품 상세정보를 불러오지 못했습니다.');
      } finally {
        setDetailLoading(false);
      }
    }

    loadDetail();
  }, [route]);

  function handlePageChange(nextPage) {
    const safeNextPage = Math.min(Math.max(nextPage, 1), pagination.totalPages);

    if (safeNextPage === pagination.page) {
      return;
    }

    setListLoading(true);
    setInsightsLoading(true);
    setInsights([]);
    setError('');
    setPagination((current) => ({
      ...current,
      page: safeNextPage,
    }));
  }

  return (
    <div className="app-shell">
      <header className="hero-band">
        <div className="hero-copy">
          <p className="eyebrow">AI Grocery Decision Assistant</p>
          <h1>AI 장보기 Agent</h1>
          <p className="hero-subtitle">신선도, 유통기한, 가격 효율, 자녀 안전성을 AI가 비교해드립니다.</p>
        </div>
        <div className="hero-status-panel">
          <div className="status-pill">
            <span className={`status-dot ${health?.status === 'ok' ? 'online' : 'offline'}`} />
            {health?.status === 'ok' ? '백엔드 연결 정상' : '연결 확인 필요'}
          </div>
          <div className="status-metadata">
            <span>상품 수 {pagination.total}개</span>
          </div>
        </div>
      </header>

      <div className={`workspace ${route.view === 'detail' ? 'workspace-detail' : ''}`}>
        <main className="catalog-panel">
          {(route.view === 'detail' && detailLoading) || (route.view === 'list' && listLoading && !products.length) ? (
            <div className="panel-state">{route.view === 'detail' ? '상품 상세정보를 불러오는 중입니다.' : '상품 목록을 불러오는 중입니다.'}</div>
          ) : error ? (
            <div className="panel-state panel-error">{error}</div>
          ) : route.view === 'detail' ? (
            <ProductDetail
              product={selectedProduct}
              onBack={() => {
                window.location.hash = '#/';
              }}
            />
          ) : (
            <ProductGrid
              products={products}
              insights={insights}
              insightsLoading={insightsLoading}
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          )}
        </main>

        {route.view === 'list' ? (
          <aside className="assistant-panel">
            <ChatBot products={products} apiReady={Boolean(health)} />
          </aside>
        ) : null}
      </div>
    </div>
  );
}

export default App;
