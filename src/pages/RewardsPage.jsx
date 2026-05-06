import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import './RewardsPage.css';

export default function RewardsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [rewardPoints, setRewardPoints] = useState(() => Number(localStorage.getItem('echoedu_reward_points')) || 0);
  const [purchasedItems, setPurchasedItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('echoedu_purchased_items')) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('echoedu_reward_points', rewardPoints);
  }, [rewardPoints]);

  useEffect(() => {
    localStorage.setItem('echoedu_purchased_items', JSON.stringify(purchasedItems));
  }, [purchasedItems]);

  const rewards = [
    {
      id: 'hint_boost',
      name: t('Hint Boost'),
      description: t('Get extra hints during difficult questions'),
      cost: 25,
      icon: '💡',
      category: 'learning'
    },
    {
      id: 'streak_freeze',
      name: t('Streak Freeze'),
      description: t('Freeze your learning streak for 3 days'),
      cost: 50,
      icon: '🧊',
      category: 'protection'
    },
    {
      id: 'custom_avatar',
      name: t('Custom Avatar'),
      description: t('Unlock a special profile avatar'),
      cost: 100,
      icon: '👤',
      category: 'cosmetic'
    },
    {
      id: 'bonus_chapter',
      name: t('Bonus Chapter'),
      description: t('Unlock an extra chapter in any subject'),
      cost: 75,
      icon: '📖',
      category: 'learning'
    },
    {
      id: 'motivation_pack',
      name: t('Motivation Pack'),
      description: t('Get personalized motivational messages'),
      cost: 30,
      icon: '🎯',
      category: 'learning'
    },
    {
      id: 'achievement_frame',
      name: t('Achievement Frame'),
      description: t('Special frame for your profile achievements'),
      cost: 150,
      icon: '🏆',
      category: 'cosmetic'
    }
  ];

  const purchaseReward = (reward) => {
    if (rewardPoints >= reward.cost && !purchasedItems.includes(reward.id)) {
      setRewardPoints(prev => prev - reward.cost);
      setPurchasedItems(prev => [...prev, reward.id]);
      alert(`${t('Successfully purchased')} ${reward.name}! 🎉`);
    }
  };

  const getTotalSpent = () => {
    return purchasedItems.reduce((total, itemId) => {
      const reward = rewards.find(r => r.id === itemId);
      return total + (reward ? reward.cost : 0);
    }, 0);
  };

  return (
    <div className="rewards-page">
      <div className="rewards-header">
        <button className="back-btn" onClick={() => navigate('/tutor')}>
          ← {t("Back to Tutor")}
        </button>
        <h1>🏪 {t("Rewards Store")}</h1>
        <div className="points-display">
          <span className="current-points">⭐ {rewardPoints} {t("points")}</span>
        </div>
      </div>

      <div className="rewards-stats">
        <div className="stat-card">
          <h3>{t("Total Points")}</h3>
          <p className="stat-value">{rewardPoints}</p>
        </div>
        <div className="stat-card">
          <h3>{t("Items Purchased")}</h3>
          <p className="stat-value">{purchasedItems.length}</p>
        </div>
        <div className="stat-card">
          <h3>{t("Points Spent")}</h3>
          <p className="stat-value">{getTotalSpent()}</p>
        </div>
      </div>

      <div className="rewards-grid">
        {rewards.map((reward) => {
          const isPurchased = purchasedItems.includes(reward.id);
          const canAfford = rewardPoints >= reward.cost;

          return (
            <div key={reward.id} className={`reward-card ${isPurchased ? 'purchased' : ''} ${!canAfford ? 'disabled' : ''}`}>
              <div className="reward-icon">{reward.icon}</div>
              <div className="reward-info">
                <h3>{reward.name}</h3>
                <p>{reward.description}</p>
                <div className="reward-cost">
                  <span className="cost-amount">⭐ {reward.cost}</span>
                  {isPurchased && <span className="purchased-badge">✓ {t("Owned")}</span>}
                </div>
              </div>
              <button
                className="purchase-btn"
                onClick={() => purchaseReward(reward)}
                disabled={isPurchased || !canAfford}
              >
                {isPurchased ? t("Owned") : canAfford ? t("Buy") : t("Need Points")}
              </button>
            </div>
          );
        })}
      </div>

      <div className="rewards-footer">
        <p>{t("Earn points by asking questions and completing chapters!")}</p>
        <p>{t("Keep learning to unlock more rewards! 📚✨")}</p>
      </div>
    </div>
  );
}