import ReactApexChart from "react-apexcharts";
import getChartColorsArray from "../../Components/Common/ChartsDynamicColor";

const PortfolioCharts = ({ dataColors, series }: any) => {
	var donutchartportfolioColors = getChartColorsArray(dataColors);

	var options: any = {
		labels: ["Bitcoin", "Ethereum", "Litecoin", "Dash"],
		chart: {
			type: "donut",
			height: 224,
		},

		plotOptions: {
			pie: {
				size: 100,
				offsetX: 0,
				offsetY: 0,
				donut: {
					size: "70%",
					labels: {
						show: true,
						name: {
							show: true,
							fontSize: "18px",
							offsetY: -5,
						},
						value: {
							show: true,
							fontSize: "20px",
							color: "#343a40",
							fontWeight: 500,
							offsetY: 5,
							formatter: (val: number) => `$${val}`,
						},
						total: {
							show: true,
							fontSize: "13px",
							label: "Total value",
							color: "#9599ad",
							fontWeight: 500,
							formatter: (w: { globals: { seriesTotals: number[] } }) =>
								"$" +
								w.globals.seriesTotals.reduce(
									(a: number, b: number) => a + b,
									0,
								),
						},
					},
				},
			},
		},
		dataLabels: {
			enabled: false,
		},
		legend: {
			show: false,
		},
		yaxis: {
			labels: {
				formatter: (value: number) => `$${value}`,
			},
		},
		stroke: {
			lineCap: "round",
			width: 2,
		},
		colors: donutchartportfolioColors,
	};
	return (
		<ReactApexChart
			dir="ltr"
			options={options}
			series={series}
			type="donut"
			height="224"
			className="apex-charts"
		/>
	);
};

interface MarkerChartsProps {
	dataColors: string;
	series: Array<{ data: Array<{ x: Date; y: number[] }> }>;
}

const MarkerCharts = ({ dataColors, series }: MarkerChartsProps) => {
	const MarketchartColors = getChartColorsArray(dataColors);

	const options: Record<string, unknown> = {
		chart: {
			type: "candlestick",
			height: 294,
			toolbar: {
				show: false,
			},
		},
		plotOptions: {
			candlestick: {
				colors: {
					upward: MarketchartColors[0],
					downward: MarketchartColors[1],
				},
			},
		},
		xaxis: {
			type: "datetime",
		},
		yaxis: {
			tooltip: {
				enabled: true,
			},
			labels: {
				formatter: (value: any) => `$${value}`,
			},
		},
		tooltip: {
			shared: true,
			y: [
				{
					formatter: (y: any) => {
						if (typeof y !== "undefined") {
							return y.toFixed(0);
						}
						return y;
					},
				},
				{
					formatter: (y: any) => {
						if (typeof y !== "undefined") {
							return `$${y.toFixed(2)}k`;
						}
						return y;
					},
				},
				{
					formatter: (y: any) => {
						if (typeof y !== "undefined") {
							return `${y.toFixed(0)} Sales`;
						}
						return y;
					},
				},
			],
		},
	};
	return (
		<ReactApexChart
			dir="ltr"
			options={options}
			series={series}
			type="candlestick"
			height="294"
			className="apex-charts"
		/>
	);
};

const WidgetsCharts = ({ seriesData, chartsColor }: any) => {
	const areachartlitecoinColors = [chartsColor];
	var options: any = {
		chart: {
			width: 130,
			height: 46,
			type: "area",
			sparkline: {
				enabled: true,
			},
			toolbar: {
				show: false,
			},
		},
		dataLabels: {
			enabled: false,
		},
		stroke: {
			curve: "smooth",
			width: 1.5,
		},
		fill: {
			type: "gradient",
			gradient: {
				shadeIntensity: 1,
				inverseColors: false,
				opacityFrom: 0.45,
				opacityTo: 0.05,
				stops: [50, 100, 100, 100],
			},
		},
		colors: areachartlitecoinColors,
	};
	return (
		<ReactApexChart
			dir="ltr"
			options={options}
			series={[...seriesData]}
			type="area"
			height="46"
			className="apex-charts"
		/>
	);
};

export { PortfolioCharts, MarkerCharts, WidgetsCharts };
