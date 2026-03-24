
import Chart from "react-apexcharts";
import { useTheme } from "src/components/provider/theme-provider";
import CardBox from "src/components/shared/CardBox";
import { TicketData } from "src/api/ticket/ticket-data";
import { useEffect, useState } from "react";

interface ChartDataState {
  categories: string[];
  series: {
    name: string;
    data: number[];
  }[];
}

const SalesOverview = () => {
  const { theme } = useTheme();
  const primary = "rgba(93, 135, 255, 1)";
  const secondary = "rgba(73, 190, 255, 1)";
  const tertiary = "rgba(255, 193, 7, 1)";
  const API_URL = import.meta.env.VITE_API_URL;

  const [chartData, setChartData] = useState<ChartDataState>({
    categories: [],
    series: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productResponse, logoClientResponse] = await Promise.all([
          fetch(`${API_URL}/products?locale=en`),
          fetch(`${API_URL}/logo-clients`),
        ]);

        const productData = await productResponse.json();
        const logoClientData = await logoClientResponse.json();

        const products = productData.success ? productData.data.length : 0;
        const logoClients = logoClientData.success ? logoClientData.data.length : 0;
        const contacts = TicketData.length;

        const series = [
          {
            name: "Contacts",
            data: [contacts],
          },
          {
            name: "Logo Clients",
            data: [logoClients],
          },
          {
            name: "Products",
            data: [products],
          },
        ];

        setChartData({
          categories: ["Data"],
          series,
        });
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };

    fetchData();
  }, [API_URL]);

  const optionsSalesOverview: ApexCharts.ApexOptions = {
    grid: {
      show: true,
      borderColor: "transparent",
      strokeDashArray: 2,
      padding: {
        left: 0,
        right: 0,
        bottom: -13,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "42%",
        borderRadius: 5,
      },
    },
    colors: [primary, secondary, tertiary],
    fill: {
      type: "solid",
      opacity: 1,
    },
    chart: {
      offsetX: -15,
      toolbar: {
        show: false,
      },
      foreColor: "#adb0bb",
      fontFamily: "inherit",
      sparkline: {
        enabled: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: 0,
    },
    legend: {
      show: false,
    },
    xaxis: {
      type: "category",
      categories: chartData.categories,
      labels: {
        style: {
          cssClass: "text-muted fill-cove",
        },
      },
    },
    yaxis: {
      show: true,
      min: 0,
      max: 500,
      tickAmount: 5,
      labels: {
        style: {
          cssClass: "text-muted fill-cove",
        },
      },
    },
    stroke: {
      show: true,
      width: 5,
      lineCap: "butt",
      colors: ["transparent"],
    },
    tooltip: {
      theme: theme,
      x: {
        format: "dd/MM/yy HH:mm",
      },
    },
  };

  return (
    <CardBox>
      <div className="flex items-center justify-between">
        <div>
          <h5 className="text-xl font-semibold">Data Overview</h5>
          <p className="text-sm text-cove">Client and Product Information</p>
        </div>
        <div className="flex items-center">
          <div className="flex items-center">
            <span className="w-2 h-2 me-2 inline-block bg-primary rounded-full"></span>
            <p className="text-xs text-cove me-4">Contacts</p>
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 me-2 inline-block bg-secondary rounded-full"></span>
            <p className="text-xs text-cove me-4">Logo Clients</p>
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 me-2 inline-block bg-warning rounded-full"></span>
            <p className="text-xs text-cove">Products</p>
          </div>
        </div>
      </div>
      <div className="mt-8">
        <Chart
          options={optionsSalesOverview}
          series={chartData.series}
          type="bar"
          height="400px"
          width="100%"
        />
      </div>
    </CardBox>
  );
};

export default SalesOverview;
