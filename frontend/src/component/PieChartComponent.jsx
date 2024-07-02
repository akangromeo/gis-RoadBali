import React, { useEffect } from "react";
import ApexCharts from "apexcharts";

const PieChartComponent = ({ id, series, colors, labels }) => {
  useEffect(() => {
    if (typeof ApexCharts !== "undefined" && id) {
      const chart = new ApexCharts(document.getElementById(id), {
        series: series,
        colors: colors,
        chart: {
          type: "pie",
          height: 260,
          animations: {
            enabled: false,
          },
        },
        plotOptions: {
          pie: {
            expandOnClick: false,
            dataLabels: {
              offset: -10,
              formatter: function (val) {
                return val + "%";
              },
            },
          },
        },
        labels: labels,
        dataLabels: {
          enabled: true,
          style: {
            fontFamily: "Inter, sans-serif",
          },
        },
        legend: {
          position: "bottom",
          fontFamily: "Inter, sans-serif",
        },

        states: {
          normal: {
            filter: {
              type: "none",
            },
          },
          hover: {
            filter: {
              type: "none",
            },
          },
          active: {
            allowMultipleDataPointsSelection: false,
            filter: {
              type: "none",
            },
          },
        },
      });

      chart.render();

      return () => {
        chart.destroy();
      };
    }
  }, [id, series, colors, labels]);

  return <div id={id} />;
};

export default PieChartComponent;
