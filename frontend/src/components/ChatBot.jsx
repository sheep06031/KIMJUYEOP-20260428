import { useEffect, useRef, useState } from 'react';
import { sendChatMessage } from '../api';

const quickQuestions = [
  '아이도 먹을 수 있는 신선한 사과 추천해줘',
  '4인 가족 기준 대용량 물티슈가 이득이야?',
  '자녀 피부에 자극 적은 생필품만 골라줘',
  '유통기한 리스크가 적은 식품을 추천해줘',
  '가격보다 안전성이 중요한 상품을 골라줘',
];

const initialMessage = {
  role: 'assistant',
  content:
    "안녕하세요. 현재 상품 상세정보를 바탕으로 신선도, 가격 효율, 자녀 안전성을 비교해드릴게요. 예: '아이도 먹을 수 있는 사과랑 자극 적은 물티슈 추천해줘'",
};

const storageLabel = { small: '보관 좁음', medium: '보관 보통', large: '보관 넓음' };
const usageLabel = { low: '사용량 적음', medium: '사용량 보통', high: '사용량 많음' };

function formatConditionTags(conditions) {
  if (!conditions) return [];
  const tags = [`${conditions.familySize}인 가족`];
  if (conditions.hasChildren) tags.push('자녀 있음');
  tags.push(storageLabel[conditions.storageSpace] || conditions.storageSpace);
  tags.push(usageLabel[conditions.monthlyUsage] || conditions.monthlyUsage);
  return tags;
}

function loadMessages() {
  try {
    const saved = localStorage.getItem('chat-messages');
    return saved ? JSON.parse(saved) : [initialMessage];
  } catch {
    return [initialMessage];
  }
}

function ChatBot({ products, apiReady }) {
  const [messages, setMessages] = useState(loadMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [conditions, setConditions] = useState({
    familySize: 4,
    hasChildren: true,
    storageSpace: 'medium',
    monthlyUsage: 'medium',
  });
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    localStorage.setItem('chat-messages', JSON.stringify(messages));
  }, [messages]);

  function updateCondition(key, value) {
    setConditions((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(text) {
    const question = text.trim();
    if (!question || loading) {
      return;
    }

    setError('');
    const nextUserMessage = { role: 'user', content: question };
    const nextMessages = [...messages, nextUserMessage];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await sendChatMessage({
        messages: nextMessages,
        ...conditions,
      });

      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: response.reply,
          recommendedProducts: response.recommendedProducts || [],
          comparedFactors: response.comparedFactors || [],
          conditions: { ...conditions },
          mode: response.mode,
        },
      ]);
    } catch (submitError) {
      setError('채팅 응답을 받아오지 못했습니다. 백엔드 상태를 확인해주세요.');
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: '응답 생성 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="chat-panel">
      <div className="chat-panel-header">
        <div>
          <p className="section-label">화면 내 AI 챗봇</p>
          <h2>구매 판단 도우미</h2>
        </div>
        <span className="chat-mode">{apiReady ? '실시간 API 연결' : '연결 대기'}</span>
      </div>

      <div className="chat-settings">
        <label>
          가족 수
          <input
            type="number"
            min="1"
            value={conditions.familySize}
            onChange={(event) => updateCondition('familySize', Number(event.target.value) || 1)}
          />
        </label>
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={conditions.hasChildren}
            onChange={(event) => updateCondition('hasChildren', event.target.checked)}
          />
          자녀 있음
        </label>
        <label>
          보관 공간
          <select value={conditions.storageSpace} onChange={(event) => updateCondition('storageSpace', event.target.value)}>
            <option value="small">small</option>
            <option value="medium">medium</option>
            <option value="large">large</option>
          </select>
        </label>
        <label>
          월 사용량
          <select value={conditions.monthlyUsage} onChange={(event) => updateCondition('monthlyUsage', event.target.value)}>
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </select>
        </label>
      </div>

      <div className="quick-question-list">
        {quickQuestions.map((question) => (
          <button key={question} type="button" onClick={() => setInput(question)} disabled={loading}>
            {question}
          </button>
        ))}
      </div>

      <div className="message-stream">
        {messages.map((message, index) => (
          <article key={`${message.role}-${index}`} className={`chat-bubble ${message.role}`}>
            <p>{message.content}</p>

            {message.role === 'assistant' && Array.isArray(message.recommendedProducts) && message.recommendedProducts.length > 0 ? (
              <div className="recommendation-badges">
                {formatConditionTags(message.conditions).length > 0 && (
                  <div className="badge-condition-tags">
                    {formatConditionTags(message.conditions).map((tag) => (
                      <span key={tag} className="badge-condition-tag">{tag}</span>
                    ))}
                  </div>
                )}
                {message.recommendedProducts.map((item) => {
                  const targetId = item.productId || products.find((p) => p.name === item.productName)?.id;
                  return (
                    <button
                      key={item.productName}
                      type="button"
                      className="recommendation-badge"
                      onClick={() => targetId && (window.location.hash = `/products/${targetId}`)}
                      disabled={!targetId}
                    >
                      <div className="badge-top">
                        <span className="badge-name">{item.productName}</span>
                      </div>
                      {item.reason && <span className="badge-reason">{item.reason}</span>}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </article>
        ))}

        {loading ? <div className="chat-bubble assistant pending">AI가 현재 상품 목록을 기준으로 답변을 정리하고 있습니다.</div> : null}
        <div ref={endRef} />
      </div>

      {error ? <div className="chat-error">{error}</div> : null}

      <form
        className="chat-input-row"
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit(input);
        }}
      >
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="아이도 먹을 수 있는 신선한 사과와 자극 적은 물티슈를 실속 있게 추천해줘."
        />
        <button type="submit" disabled={loading || !products.length}>
          전송
        </button>
      </form>
    </section>
  );
}

export default ChatBot;
