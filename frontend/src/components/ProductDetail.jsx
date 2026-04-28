function ProductDetail({ product, onBack }) {
  if (!product) {
    return <div className="panel-state">상품 상세정보를 불러오는 중입니다.</div>;
  }

  return (
    <section className="detail-page">
      <button type="button" className="back-link" onClick={onBack}>
        목록으로 돌아가기
      </button>

      <div className="detail-hero">
        <img src={product.imageUrl} alt={product.name} className="detail-image" />
        <div className="detail-summary">
          <p className="store-card-category">{product.category}</p>
          <h2>{product.name}</h2>
          <p className="detail-price">{product.price.toLocaleString()}원</p>
          <p className="detail-unit">
            {product.unit}
            {product.unitPrice && (
              <span className="unit-price"> · {product.unitPrice.toLocaleString()}{product.unitLabel}</span>
            )}
          </p>
          <p className="detail-description">{product.description}</p>
        </div>
      </div>

      <div className="detail-content">
        {product.aiSummary && (
          <section className="decision-box">
            <h4>AI 구매 판단 요약</h4>
            <div className="decision-row">
              <span>요약</span>
              <p>{product.aiSummary.purchaseSummary}</p>
            </div>
            {product.aiSummary.freshnessNote && (
              <div className="decision-row">
                <span>신선도</span>
                <p>{product.aiSummary.freshnessNote}</p>
              </div>
            )}
            {product.aiSummary.childSafetyNote && (
              <div className="decision-row">
                <span>자녀 안전성</span>
                <p>{product.aiSummary.childSafetyNote}</p>
              </div>
            )}
            <div className="decision-row">
              <span>실속 비교</span>
              <p>{product.aiSummary.valueNote}</p>
            </div>
            {product.aiSummary.caution && (
              <div className="decision-row">
                <span>주의사항</span>
                <p>{product.aiSummary.caution}</p>
              </div>
            )}
            <div className="decision-row">
              <span>추천 대상</span>
              <p>{product.aiSummary.fitNote}</p>
            </div>
          </section>
        )}
        <section className="decision-box">
          <h4>리뷰</h4>
          <ul>
            {(product.reviews || []).map((text, i) => (
              <li key={i}>{text}</li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}

export default ProductDetail;
