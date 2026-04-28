import ProductCard from './ProductCard';

function ProductGrid({ products, insights, insightsLoading, pagination, onPageChange }) {
  const { page, total, totalPages } = pagination;
  const insightMap = new Map((insights || []).map((item) => [item.id, item]));
  const pageButtons = [];
  const startPage = Math.max(1, page - 2);
  const endPage = Math.min(totalPages, startPage + 4);

  for (let currentPage = startPage; currentPage <= endPage; currentPage += 1) {
    pageButtons.push(currentPage);
  }

  return (
    <section className="catalog-section">
      <div className="catalog-header">
        <div>
          <p className="section-label">쇼핑몰 상품 목록</p>
          <h2>파싱된 상품 카드</h2>
        </div>
        <div className="catalog-summary">
          <span>전체 {total}개 상품</span>
          <span>{page} / {totalPages} 페이지</span>
        </div>
      </div>

      <div className="product-grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            insight={insightMap.get(product.id)}
            insightsLoading={insightsLoading}
          />
        ))}
      </div>

      <div className="pagination-bar">
        <button type="button" onClick={() => onPageChange(page - 1)} disabled={page === 1}>
          이전
        </button>
        <div className="pagination-numbers">
          {pageButtons.map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              className={pageNumber === page ? 'is-active' : ''}
              onClick={() => onPageChange(pageNumber)}
              disabled={pageNumber === page}
            >
              {pageNumber}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => onPageChange(page + 1)} disabled={page === totalPages}>
          다음
        </button>
      </div>
    </section>
  );
}

export default ProductGrid;
