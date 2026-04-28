function ProductCard({ product, insight, insightsLoading }) {
  function handleCardClick() {
    window.location.hash = `/products/${product.id}`;
  }

  return (
    <article className="store-card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <img src={product.imageUrl} alt={product.name} className="store-card-image" />

      <div className="store-card-top">
        <div>
          <p className="store-card-category">{product.category}</p>
          <h3 className="store-card-title-link">{product.name}</h3>
        </div>
        <div className="store-card-price">
          <strong>{product.price.toLocaleString()}원</strong>
          <span>{product.unit}</span>
          {product.unitPrice && (
            <span className="unit-price">{product.unitPrice.toLocaleString()}{product.unitLabel}</span>
          )}
        </div>
      </div>

      <p className="store-card-description">{product.description}</p>

      <section className="decision-box">
        <h4>AI 구매 판단 요약</h4>
        {insight ? (
          <>
            <div className="decision-row">
              <span>요약</span>
              <p>{insight.purchaseSummary}</p>
            </div>
            {insight.freshnessNote && (
              <div className="decision-row">
                <span>신선도</span>
                <p>{insight.freshnessNote}</p>
              </div>
            )}
            {insight.childSafetyNote && (
              <div className="decision-row">
                <span>자녀 안전성</span>
                <p>{insight.childSafetyNote}</p>
              </div>
            )}
            <div className="decision-row">
              <span>실속 비교</span>
              <p>{insight.valueNote}</p>
            </div>
            {insight.caution && (
              <div className="decision-row">
                <span>주의사항</span>
                <p>{insight.caution}</p>
              </div>
            )}
            <div className="decision-row">
              <span>추천 대상</span>
              <p>{insight.fitNote}</p>
            </div>
          </>
        ) : insightsLoading ? (
          <div className="insight-skeleton-group">
            <div className="insight-skeleton-line short" />
            <div className="insight-skeleton-line" />
            <div className="insight-skeleton-line" />
            <div className="insight-skeleton-line medium" />
            <div className="insight-skeleton-badge" />
          </div>
        ) : (
          <div className="decision-row">
            <span>상태</span>
            <p>AI 요약을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</p>
          </div>
        )}
      </section>
    </article>
  );
}

export default ProductCard;
