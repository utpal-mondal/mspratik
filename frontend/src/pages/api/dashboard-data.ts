import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Mock data - replace with actual data fetching logic
    const dashboardData = {
      picklistCount: 42,
      orderCount: 128,
      customerCount: 89,
      revenue: 125000,
      stats: {
        pending: 12,
        inProgress: 8,
        completed: 95,
        cancelled: 3
      },
      recentOrders: [
        { id: 1001, customer: 'John Doe', amount: 1250, status: 'completed' },
        { id: 1002, customer: 'Jane Smith', amount: 890, status: 'in_progress' },
        { id: 1003, customer: 'Acme Corp', amount: 2450, status: 'pending' },
        { id: 1004, customer: 'Tech Solutions', amount: 1750, status: 'completed' },
      ]
    };

    res.status(200).json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export default handler;
