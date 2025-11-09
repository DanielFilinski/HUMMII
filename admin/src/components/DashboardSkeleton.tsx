import { motion } from 'framer-motion';
import { Card, Skeleton } from 'antd';

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Skeleton для статистических карточек */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card
              style={{
                borderRadius: '16px',
                boxShadow: '0 10px 30px rgba(102, 126, 234, 0.2)',
              }}
            >
              <Skeleton active paragraph={{ rows: 2 }} />
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Skeleton для графиков */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card
            style={{
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              height: '400px',
            }}
          >
            <Skeleton active paragraph={{ rows: 8 }} />
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card
            style={{
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              height: '400px',
            }}
          >
            <Skeleton active paragraph={{ rows: 8 }} />
          </Card>
        </motion.div>
      </div>

      {/* Skeleton для таблицы */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card
          style={{
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}
        >
          <Skeleton active paragraph={{ rows: 5 }} />
        </Card>
      </motion.div>
    </div>
  );
}
