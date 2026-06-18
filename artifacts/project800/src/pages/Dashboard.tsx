import { useEffect } from "react";
import { useAppData } from "@/hooks/useAppData";
import { formatINR } from "@/utils/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  const { months, budget } = useAppData();

  const totalTarget = 800;
  const totalBudget = 4000000;
  
  const admissionsSoFar = months.reduce((sum, m) => sum + (Number(m.actualAdm) || 0), 0);
  const remainingSeats = totalTarget - admissionsSoFar;
  
  const budgetSpent = months.reduce((sum, m) => sum + (Number(m.actualSpend) || 0), 0);
  const budgetRemaining = totalBudget - budgetSpent;
  
  const enquiriesTotal = months.reduce((sum, m) => sum + (Number(m.actualEnq) || 0), 0);

  const labels = months.map(m => m.month.split(" ")[0]);
  
  // Cumulative calculations
  let cumPlan = 0;
  let cumActual = 0;
  const cumulativePlanAdm = months.map(m => cumPlan += (Number(m.planAdm) || 0));
  const cumulativeActualAdm = months.map(m => cumActual += (Number(m.actualAdm) || 0));

  const admLineData = {
    labels,
    datasets: [
      {
        label: 'Planned Cumulative',
        data: cumulativePlanAdm,
        borderColor: '#94a3b8',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        tension: 0.4,
      },
      {
        label: 'Actual Cumulative',
        data: cumulativeActualAdm,
        borderColor: '#0f766e',
        backgroundColor: 'rgba(15, 118, 110, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ]
  };

  const spendBarData = {
    labels,
    datasets: [
      {
        label: 'Planned',
        data: months.map(m => m.planSpend),
        backgroundColor: '#cbd5e1',
      },
      {
        label: 'Actual',
        data: months.map(m => m.actualSpend),
        backgroundColor: '#b45309',
      }
    ]
  };

  const enqBarData = {
    labels,
    datasets: [
      {
        label: 'Planned',
        data: months.map(m => m.planEnq),
        backgroundColor: '#cbd5e1',
      },
      {
        label: 'Actual',
        data: months.map(m => m.actualEnq),
        backgroundColor: '#0f766e',
      }
    ]
  };

  const visits = Math.round(enquiriesTotal * 0.2);
  const applications = Math.round(visits * 0.5); // 10% of total
  
  const funnelData = {
    labels: ['Enquiries', 'Visits (20%)', 'Applications (10%)', 'Admissions'],
    datasets: [{
      label: 'Count',
      data: [enquiriesTotal, visits, applications, admissionsSoFar],
      backgroundColor: ['#94a3b8', '#cbd5e1', '#b45309', '#0f766e'],
      indexAxis: 'y' as const,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const }
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Total Target" value={totalTarget} />
        <StatCard title="Admissions" value={admissionsSoFar} highlight />
        <StatCard title="Remaining Seats" value={remainingSeats} />
        <StatCard title="Budget Spent" value={formatINR(budgetSpent)} />
        <StatCard title="Budget Remaining" value={formatINR(budgetRemaining)} />
        <StatCard title="Total Enquiries" value={enquiriesTotal} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cumulative Admissions</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <Line data={admLineData} options={chartOptions} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Spend (₹)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <Bar data={spendBarData} options={chartOptions} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Enquiries</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <Bar data={enqBarData} options={chartOptions} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Admission Funnel</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <Bar data={funnelData} options={{...chartOptions, indexAxis: 'y'}} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, highlight = false }: { title: string, value: string | number, highlight?: boolean }) {
  return (
    <Card className={highlight ? "border-primary shadow-sm" : "shadow-sm"}>
      <CardContent className="p-4 flex flex-col justify-center h-full">
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <p className={`text-2xl font-bold ${highlight ? "text-primary" : "text-slate-800"}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
