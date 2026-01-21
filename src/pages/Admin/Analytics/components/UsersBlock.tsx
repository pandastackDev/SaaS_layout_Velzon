import React, { useMemo } from 'react';
import { Row, Col, Card, CardBody, CardHeader } from 'reactstrap';
import ReactApexChart from 'react-apexcharts';

interface UsersBlockProps {
  profiles: any[];
  subscriptions: any[];
}

const UsersBlock: React.FC<UsersBlockProps> = ({ profiles, subscriptions }) => {
  // Chart 1: User Registration Trends (12 months)
  const registrationTrendsData = useMemo(() => {
    const last12Months = Array.from({ length: 12 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (11 - i));
      return d;
    });

    const monthlyData = last12Months.map(month => {
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      
      const count = profiles.filter(p => {
        const createdAt = new Date(p.created_at);
        return createdAt >= monthStart && createdAt <= monthEnd;
      }).length;

      return {
        month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        count
      };
    });

    return {
      series: [{
        name: 'New Users',
        data: monthlyData.map(d => d.count)
      }],
      options: {
        chart: {
          type: 'line' as const,
          height: 350,
          toolbar: { show: false }
        },
        stroke: {
          curve: 'smooth' as const,
          width: 3
        },
        colors: ['#405189'],
        xaxis: {
          categories: monthlyData.map(d => d.month)
        },
        yaxis: {
          title: { text: 'Number of Users' }
        },
        title: {
          text: 'User Registration Trends (12 Months)',
          align: 'left' as const
        }
      }
    };
  }, [profiles]);

  // Chart 2: User Types Distribution
  const userTypesData = useMemo(() => {
    const types = profiles.reduce((acc: any, p) => {
      const type = p.user_type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return {
      series: Object.values(types),
      options: {
        chart: {
          type: 'pie' as const,
          height: 350
        },
        labels: Object.keys(types),
        colors: ['#405189', '#0ab39c', '#f7b84b', '#f06548'],
        legend: {
          position: 'bottom' as const
        },
        title: {
          text: 'User Types Distribution',
          align: 'left' as const
        }
      }
    };
  }, [profiles]);

  // Chart 3: Active vs Inactive Users
  const activeInactiveData = useMemo(() => {
    const active = profiles.filter(p => p.status === 'active').length;
    const inactive = profiles.length - active;

    return {
      series: [active, inactive],
      options: {
        chart: {
          type: 'donut' as const,
          height: 350
        },
        labels: ['Active', 'Inactive'],
        colors: ['#0ab39c', '#f06548'],
        legend: {
          position: 'bottom' as const
        },
        title: {
          text: 'Active vs Inactive Users',
          align: 'left' as const
        }
      }
    };
  }, [profiles]);

  // Chart 4: Banned vs Active Users
  const bannedUsersData = useMemo(() => {
    const banned = profiles.filter(p => p.is_banned).length;
    const notBanned = profiles.length - banned;

    return {
      series: [{
        data: [notBanned, banned]
      }],
      options: {
        chart: {
          type: 'bar' as const,
          height: 350,
          toolbar: { show: false }
        },
        plotOptions: {
          bar: {
            horizontal: true,
            distributed: true
          }
        },
        colors: ['#0ab39c', '#f06548'],
        xaxis: {
          categories: ['Active Users', 'Banned Users']
        },
        title: {
          text: 'Banned vs Active Users',
          align: 'left' as const
        }
      }
    };
  }, [profiles]);

  // Chart 5: Profile Status Distribution
  const profileStatusData = useMemo(() => {
    const statuses = profiles.reduce((acc: any, p) => {
      const status = p.profile_status || 'incomplete';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return {
      series: [{
        name: 'Users',
        data: Object.values(statuses)
      }],
      options: {
        chart: {
          type: 'bar' as const,
          height: 350,
          toolbar: { show: false }
        },
        plotOptions: {
          bar: {
            columnWidth: '50%'
          }
        },
        colors: ['#405189'],
        xaxis: {
          categories: Object.keys(statuses)
        },
        title: {
          text: 'Profile Status Distribution',
          align: 'left' as const
        }
      }
    };
  }, [profiles]);

  // Chart 6: Weekly Registration Trend (8 weeks)
  const weeklyRegistrationData = useMemo(() => {
    const last8Weeks = Array.from({ length: 8 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (7 * (7 - i)));
      return d;
    });

    const weeklyData = last8Weeks.map(week => {
      const weekStart = new Date(week);
      const weekEnd = new Date(week);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const count = profiles.filter(p => {
        const createdAt = new Date(p.created_at);
        return createdAt >= weekStart && createdAt <= weekEnd;
      }).length;

      return {
        week: `Week ${week.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        count
      };
    });

    return {
      series: [{
        name: 'New Users',
        data: weeklyData.map(d => d.count)
      }],
      options: {
        chart: {
          type: 'area' as const,
          height: 350,
          toolbar: { show: false }
        },
        stroke: {
          curve: 'smooth' as const
        },
        colors: ['#0ab39c'],
        xaxis: {
          categories: weeklyData.map(d => d.week)
        },
        title: {
          text: 'Weekly Registration Trend (8 Weeks)',
          align: 'left' as const
        }
      }
    };
  }, [profiles]);

  // Chart 7: Monthly Growth Rate (6 months)
  const growthRateData = useMemo(() => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return d;
    });

    const monthlyGrowth = last6Months.map((month, index) => {
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      
      const currentMonthUsers = profiles.filter(p => {
        const createdAt = new Date(p.created_at);
        return createdAt >= monthStart && createdAt <= monthEnd;
      }).length;

      const prevMonth = new Date(month);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      const prevMonthStart = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 1);
      const prevMonthEnd = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0);
      
      const prevMonthUsers = profiles.filter(p => {
        const createdAt = new Date(p.created_at);
        return createdAt >= prevMonthStart && createdAt <= prevMonthEnd;
      }).length;

      const growthRate = prevMonthUsers > 0 ? ((currentMonthUsers - prevMonthUsers) / prevMonthUsers) * 100 : 0;

      return {
        month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        rate: Math.round(growthRate * 10) / 10
      };
    });

    return {
      series: [{
        name: 'Growth Rate %',
        data: monthlyGrowth.map(d => d.rate)
      }],
      options: {
        chart: {
          type: 'line' as const,
          height: 350,
          toolbar: { show: false }
        },
        stroke: {
          curve: 'smooth' as const,
          width: 3
        },
        colors: ['#f7b84b'],
        xaxis: {
          categories: monthlyGrowth.map(d => d.month)
        },
        yaxis: {
          title: { text: 'Growth Rate (%)' }
        },
        title: {
          text: 'Monthly Growth Rate (6 Months)',
          align: 'left' as const
        }
      }
    };
  }, [profiles]);

  // Chart 8: Top 10 Countries
  const topCountriesData = useMemo(() => {
    const countries = profiles.reduce((acc: any, p) => {
      const country = p.country || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {});

    const sortedCountries = Object.entries(countries)
      .sort(([, a]: any, [, b]: any) => b - a)
      .slice(0, 10);

    return {
      series: [{
        data: sortedCountries.map(([, count]) => count)
      }],
      options: {
        chart: {
          type: 'bar' as const,
          height: 350,
          toolbar: { show: false }
        },
        plotOptions: {
          bar: {
            horizontal: true
          }
        },
        colors: ['#405189'],
        xaxis: {
          categories: sortedCountries.map(([country]) => country)
        },
        title: {
          text: 'Top 10 Countries by Users',
          align: 'left' as const
        }
      }
    };
  }, [profiles]);

  // Chart 9: User Retention Rate (6 months)
  const retentionRateData = useMemo(() => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return d;
    });

    const retentionData = last6Months.map(month => {
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      
      const usersCreatedBefore = profiles.filter(p => {
        const createdAt = new Date(p.created_at);
        return createdAt < monthStart;
      }).length;

      const activeUsersInMonth = profiles.filter(p => {
        const createdAt = new Date(p.created_at);
        const lastLogin = p.last_login ? new Date(p.last_login) : null;
        return createdAt < monthStart && lastLogin && lastLogin >= monthStart && lastLogin <= monthEnd;
      }).length;

      const retentionRate = usersCreatedBefore > 0 ? (activeUsersInMonth / usersCreatedBefore) * 100 : 0;

      return {
        month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        rate: Math.round(retentionRate * 10) / 10
      };
    });

    return {
      series: [{
        name: 'Retention Rate %',
        data: retentionData.map(d => d.rate)
      }],
      options: {
        chart: {
          type: 'bar' as const,
          height: 350,
          toolbar: { show: false }
        },
        colors: ['#0ab39c'],
        xaxis: {
          categories: retentionData.map(d => d.month)
        },
        yaxis: {
          title: { text: 'Retention Rate (%)' },
          max: 100
        },
        title: {
          text: 'User Retention Rate (6 Months)',
          align: 'left' as const
        }
      }
    };
  }, [profiles]);

  return (
    <Row>
      <Col xl={6}>
        <Card>
          <CardBody>
            <ReactApexChart
              options={registrationTrendsData.options}
              series={registrationTrendsData.series}
              type="line"
              height={350}
            />
          </CardBody>
        </Card>
      </Col>
      <Col xl={6}>
        <Card>
          <CardBody>
            <ReactApexChart
              options={userTypesData.options}
              series={userTypesData.series}
              type="pie"
              height={350}
            />
          </CardBody>
        </Card>
      </Col>
      <Col xl={6}>
        <Card>
          <CardBody>
            <ReactApexChart
              options={activeInactiveData.options}
              series={activeInactiveData.series}
              type="donut"
              height={350}
            />
          </CardBody>
        </Card>
      </Col>
      <Col xl={6}>
        <Card>
          <CardBody>
            <ReactApexChart
              options={bannedUsersData.options}
              series={bannedUsersData.series}
              type="bar"
              height={350}
            />
          </CardBody>
        </Card>
      </Col>
      <Col xl={6}>
        <Card>
          <CardBody>
            <ReactApexChart
              options={profileStatusData.options}
              series={profileStatusData.series}
              type="bar"
              height={350}
            />
          </CardBody>
        </Card>
      </Col>
      <Col xl={6}>
        <Card>
          <CardBody>
            <ReactApexChart
              options={weeklyRegistrationData.options}
              series={weeklyRegistrationData.series}
              type="area"
              height={350}
            />
          </CardBody>
        </Card>
      </Col>
      <Col xl={6}>
        <Card>
          <CardBody>
            <ReactApexChart
              options={growthRateData.options}
              series={growthRateData.series}
              type="line"
              height={350}
            />
          </CardBody>
        </Card>
      </Col>
      <Col xl={6}>
        <Card>
          <CardBody>
            <ReactApexChart
              options={topCountriesData.options}
              series={topCountriesData.series}
              type="bar"
              height={350}
            />
          </CardBody>
        </Card>
      </Col>
      <Col xl={12}>
        <Card>
          <CardBody>
            <ReactApexChart
              options={retentionRateData.options}
              series={retentionRateData.series}
              type="bar"
              height={350}
            />
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default UsersBlock;
