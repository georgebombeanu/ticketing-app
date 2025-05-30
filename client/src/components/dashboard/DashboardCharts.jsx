import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  useTheme,
} from '@mui/material';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts';

const DashboardCharts = ({ tickets = [] }) => {
  const theme = useTheme();

  // Process data for charts
  const statusData = tickets.reduce((acc, ticket) => {
    const status = ticket.statusName;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const priorityData = tickets.reduce((acc, ticket) => {
    const priority = ticket.priorityName;
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {});

  const categoryData = tickets.reduce((acc, ticket) => {
    const category = ticket.categoryName;
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  // Convert to chart-friendly format
  const statusChartData = Object.entries(statusData).map(([name, value]) => ({
    name,
    value,
  }));

  const priorityChartData = Object.entries(priorityData).map(([name, value]) => ({
    name,
    value,
  }));

  const categoryChartData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value,
  }));

  // Generate trend data (last 7 days)
  const generateTrendData = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const dayTickets = tickets.filter(ticket => {
        const ticketDate = new Date(ticket.createdAt);
        return ticketDate.toDateString() === date.toDateString();
      });

      days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        created: dayTickets.length,
        resolved: dayTickets.filter(t => t.statusName.toLowerCase() === 'resolved').length,
      });
    }
    return days;
  };

  const trendData = generateTrendData();

  // Color schemes
  const statusColors = {
    'Open': theme.palette.info.main,
    'In Progress': theme.palette.warning.main,
    'Pending': theme.palette.secondary.main,
    'Resolved': theme.palette.success.main,
    'Closed': theme.palette.grey[500],
    'Cancelled': theme.palette.error.main,
  };

  const priorityColors = {
    'Low': theme.palette.info.light,
    'Medium': theme.palette.warning.main,
    'High': theme.palette.error.main,
    'Critical': theme.palette.error.dark,
    'Urgent': '#9c27b0',
  };

  const categoryColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 1, border: 1, borderColor: 'divider' }}>
          <Typography variant="body2" fontWeight="bold">
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{ color: entry.color }}
            >
              {entry.name}: {entry.value}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  if (!tickets || tickets.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No data available for charts
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Charts will appear once tickets are created
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* Ticket Status Distribution */}
      <Grid item xs={12} md={6}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Tickets by Status
          </Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value, percent }) => 
                    `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {statusChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={statusColors[entry.name] || theme.palette.grey[400]} 
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </Grid>

      {/* Ticket Priority Distribution */}
      <Grid item xs={12} md={6}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Tickets by Priority
          </Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value">
                  {priorityChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={priorityColors[entry.name] || theme.palette.primary.main} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </Grid>

      {/* Ticket Category Distribution */}
      <Grid item xs={12} md={6}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Tickets by Category
          </Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value">
                  {categoryChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={categoryColors[index % categoryColors.length]} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </Grid>

      {/* Ticket Trend (Last 7 Days) */}
      <Grid item xs={12} md={6}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Ticket Trends (Last 7 Days)
          </Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="created" 
                  stroke={theme.palette.primary.main} 
                  strokeWidth={2}
                  name="Created"
                />
                <Line 
                  type="monotone" 
                  dataKey="resolved" 
                  stroke={theme.palette.success.main} 
                  strokeWidth={2}
                  name="Resolved"
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default DashboardCharts;