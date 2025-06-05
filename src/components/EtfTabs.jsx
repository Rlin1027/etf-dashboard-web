import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import * as echarts from 'echarts';

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_KEY
);

export default function EtfTabs({ etfList }) {
   if (!etfList || etfList.length === 0) {
    return <p>No ETF data found. Check etf_list table.</p>;
  }
  const [active, setActive] = useState(etfList[0].code);
  const [data, setData] = useState([]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('constituents')
        .select('stock_name, weight')
        .eq('etf_code', active)
        .order('weight', { ascending: false });
      if (!error) setData(data);
    })();
  }, [active]);

  useEffect(() => {
    if (!data.length) return;
    const chartDom = document.getElementById('pie');
    const myChart = echarts.init(chartDom);
    myChart.setOption({
      title: { text: '成份股權重', left: 'center' },
      tooltip: { trigger: 'item', formatter: '{b}: {d}%'},
      legend: { orient: 'vertical', left: 'right' },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          label: {
            formatter: '{b}: {d}%',
            color: '#333'
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          data: data.map((d) => ({ value: d.weight, name: d.stock_name })),
        },
      ],
    });
    return () => myChart.dispose();
  }, [data]);

  return (
    <>
      <div className="tabs">
        {etfList.map((e) => (
          <button
            key={e.code}
            className={active === e.code ? 'tab active' : 'tab'}
            onClick={() => setActive(e.code)}
          >
            {e.code}
          </button>
        ))}
      </div>

      <div id="pie" style={{ width: '100%', height: '400px' }}></div>
      <table>
        <thead>
          <tr>
            <th>股票</th>
            <th>權重 (%)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.stock_name}>
              <td>{d.stock_name}</td>
              <td>{d.weight}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <style jsx>{`
        .tabs {
          display: flex;
          gap: 12px;
          margin: 16px 0;
        }
        .tab {
          padding: 6px 12px;
          border: 1px solid #aaa;
          border-radius: 6px;
          cursor: pointer;
          background: #f5f5f5;
        }
        .active {
          background: #0070f3;
          color: #fff;
          border-color: #0070f3;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th,
        td {
          padding: 4px 8px;
          border-bottom: 1px solid #ddd;
        }
      `}</style>
    </>
  );
}
