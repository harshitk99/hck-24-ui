"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaTerminal, FaCog, FaDatabase, FaTable, FaSearch, FaCode, FaClock, FaServer, FaChartBar, FaFilter, FaDownload, FaExpand } from 'react-icons/fa';
import { Resizable } from 're-resizable';

type QueryResult = {
  timestamp: string;
  query: string;
  result: string;
  status: 'success' | 'error';
};

// Add these new types
type DataRow = {
  id: number;
  name: string;
  age: number;
  [key: string]: any;
};

type QueryAnalytics = {
  totalRows: number;
  avgAge: number;
  executionTime: string;
};

// Add this gradient background component
const GradientBackground = () => (
  <div className="absolute inset-0 -z-10">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(0,0,0,0))]" />
  </div>
);

// Add this component for displaying the executed query
const QueryCard = ({ query, timestamp }: { query: string; timestamp: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-lg border border-white/10 bg-white/5 p-4"
  >
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <FaCode className="text-blue-400" />
        <span className="text-sm font-medium">Executed Query</span>
      </div>
      <span className="text-xs text-white/40">{timestamp}</span>
    </div>
    <pre className="bg-black/20 rounded-lg p-4 overflow-x-auto text-sm text-white/80 font-mono">
      {query}
    </pre>
  </motion.div>
);

export default function EditorPage() {
  const [code, setCode] = useState(`// Example:
const query = await db.collection('users')
  .find({ age: { $gt: 21 }})
  .limit(10);`);
  
  const [consoleWidth, setConsoleWidth] = useState(400);
  const [queryHistory, setQueryHistory] = useState<QueryResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedDatabase, setSelectedDatabase] = useState('users_db');
  const consoleRef = useRef<HTMLDivElement>(null);
  const [showDashboard, setShowDashboard] = useState(true);
  const [tableData, setTableData] = useState<DataRow[]>([]);
  const [analytics, setAnalytics] = useState<QueryAnalytics>({
    totalRows: 0,
    avgAge: 0,
    executionTime: '0ms'
  });
  const [dashboardHeight, setDashboardHeight] = useState(400);
  const [lastExecutedQuery, setLastExecutedQuery] = useState<{
    query: string;
    timestamp: string;
  } | null>(null);

  const handleSend = async () => {
    try {
      setIsRunning(true);
      const timestamp = new Date().toLocaleTimeString();
      
      setLastExecutedQuery({
        query: code,
        timestamp
      });

      // Add query to history immediately
      setQueryHistory(prev => [...prev, {
        timestamp,
        query: code,
        result: 'Executing query...',
        status: 'success'
      }]);

      // Simulate API call and data fetching
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Sample data - replace with actual API response
      const mockData: DataRow[] = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        age: Math.floor(Math.random() * 40) + 20,
        email: `user${i + 1}@example.com`,
        status: Math.random() > 0.5 ? 'active' : 'inactive',
        lastLogin: new Date(Date.now() - Math.random() * 10000000000).toISOString()
      }));

      setTableData(mockData);
      setAnalytics({
        totalRows: mockData.length,
        avgAge: mockData.reduce((acc, curr) => acc + curr.age, 0) / mockData.length,
        executionTime: '0.123s'
      });

      // Update with result
      setQueryHistory(prev => [
        ...prev.slice(0, -1),
        {
          timestamp,
          query: code,
          result: JSON.stringify({
            results: [
              { id: 1, name: 'John Doe', age: 25 },
              { id: 2, name: 'Jane Smith', age: 28 }
            ],
            executionTime: '0.123s',
            rowsAffected: 2
          }, null, 2),
          status: 'success'
        }
      ]);
    } catch (error) {
      setQueryHistory(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        query: code,
        result: 'Error: Query execution failed',
        status: 'error'
      }]);
    } finally {
      setIsRunning(false);
      // Scroll console to bottom
      if (consoleRef.current) {
        consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
      }
    }
  };

  return (
    <div className="relative flex h-screen flex-col bg-black text-white">
      <GradientBackground />
      
      {/* Top Navigation Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex h-14 items-center justify-between border-b border-white/10 bg-black/30 px-6 backdrop-blur-sm"
      >
        <div className="flex items-center gap-6">
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
          >
            <div className="rounded-full bg-blue-500/10 p-2">
              <FaServer className="text-blue-400" />
            </div>
            <select 
              className="rounded-lg border border-white/10 bg-black/30 px-4 py-1.5 text-sm backdrop-blur-sm transition-colors hover:border-blue-500/50 focus:border-blue-500/50 focus:outline-none"
              value={selectedDatabase}
              onChange={(e) => setSelectedDatabase(e.target.value)}
            >
              <option value="users_db">users_db</option>
              <option value="products_db">products_db</option>
              <option value="orders_db">orders_db</option>
            </select>
          </motion.div>
          
          <div className="h-6 w-[1px] bg-white/10" />
          
          <div className="flex gap-3">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-1.5 text-sm transition-all hover:border-purple-500/50 hover:bg-white/10"
            >
              <FaTable className="text-purple-400 transition-transform group-hover:scale-110" />
              <span>Schema</span>
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-1.5 text-sm transition-all hover:border-green-500/50 hover:bg-white/10"
            >
              <FaClock className="text-green-400 transition-transform group-hover:scale-110" />
              <span>History</span>
            </motion.button>
          </div>
        </div>

        <motion.button
          onClick={handleSend}
          disabled={isRunning}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-2 text-sm font-medium transition-all hover:from-blue-600 hover:to-purple-600 ${
            isRunning ? 'opacity-50' : ''
          }`}
        >
          {isRunning ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          ) : (
            <>
              <FaPlay className="text-xs" />
              <span>Execute Query</span>
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Main Content */}
      <div className="flex flex-1 min-h-[30vh] overflow-hidden">
        {/* Editor Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-1 flex-col border-r border-white/10 bg-black/30 backdrop-blur-sm"
        >
          {/* Editor Tabs */}
          <div className="flex h-10 items-center border-b border-white/10 px-4">
            <div className="flex items-center gap-2 rounded-t-lg border-b-2 border-blue-500 bg-white/5 px-4 py-2 text-sm">
              <FaCode className="text-blue-400" />
              <span>query.sql</span>
            </div>
          </div>
          
          {/* Code Editor */}
          <div className="relative flex-1 bg-black/20">
            <div className="absolute left-0 top-0 h-full w-12 border-r border-white/10 bg-white/5 py-4 text-right">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="px-4 text-xs text-white/30">
                  {i + 1}
                </div>
              ))}
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="h-full w-full resize-none bg-transparent py-4 pl-16 pr-4 font-mono text-sm leading-6 text-white/80 focus:outline-none"
              spellCheck="false"
              placeholder="Write your query here..."
            />
          </div>
        </motion.div>

        {/* Resizable Console */}
        <Resizable
          size={{ width: consoleWidth, height: '100%' }}
          onResizeStop={(e, direction, ref, d) => {
            setConsoleWidth(consoleWidth + d.width);
          }}
          minWidth={300}
          maxWidth={800}
          enable={{ left: true }}
          className="relative border-l border-white/10 bg-black/30 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-full flex flex-col"
          >
            <div className="flex h-10 items-center justify-between border-b border-white/10 px-4">
              <div className="flex items-center gap-2 text-sm">
                <FaTerminal className="text-green-400" />
                <span>Query Results</span>
              </div>
              <span className="text-xs text-white/40">{queryHistory.length} results</span>
            </div>
            <div 
              ref={consoleRef}
              className="flex-1 overflow-auto scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30"
            >
              <AnimatePresence mode="popLayout">
                {queryHistory.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="border-b border-white/5 p-4 font-mono text-sm transition-colors hover:bg-white/5"
                  >
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <span>{item.timestamp}</span>
                      <motion.span 
                        animate={{ scale: [1, 1.2, 1] }}
                        className={item.status === 'success' ? 'text-green-500' : 'text-red-500'}
                      >
                        ●
                      </motion.span>
                    </div>
                    <div className="mt-2 rounded bg-white/5 p-2 text-white/60">
                      <pre className="whitespace-pre-wrap">{item.query}</pre>
                    </div>
                    <div className="mt-2 rounded bg-black/40 p-2 text-white/80">
                      <pre className="whitespace-pre-wrap">{item.result}</pre>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </Resizable>
      </div>

      {/* Modified Dashboard Section */}
      <Resizable
        size={{ width: '100%', height: dashboardHeight }}
        onResizeStop={(e, direction, ref, d) => {
          setDashboardHeight(dashboardHeight + d.height);
        }}
        minHeight={300}
        maxHeight={800}
        enable={{ top: true }}
        className="border-t border-white/10 bg-black/30 backdrop-blur-sm"
      >
        <div className="absolute top-0 left-0 right-0 h-1 cursor-row-resize group">
          <div className="h-full w-full group-hover:bg-blue-500/50 transition-colors">
            <div className="mx-auto w-20 h-1 bg-white/10 group-hover:bg-blue-500 transition-colors" />
          </div>
        </div>

        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
              <FaTable className="text-purple-400" />
              <h2 className="text-sm font-medium">Query Results</h2>
              <span className="text-xs text-white/40">⟵ Drag to resize</span>
            </div>
          </div>

          <div className="flex-1 overflow-auto border-t border-white/10 p-6">
            {lastExecutedQuery ? (
              <div className="space-y-6">
                {/* Query Display */}
                <QueryCard 
                  query={lastExecutedQuery.query}
                  timestamp={lastExecutedQuery.timestamp}
                />

                {/* Results Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="rounded-lg border border-white/10 bg-white/5 p-4"
                  >
                    <div className="text-xs text-white/40">Rows Returned</div>
                    <div className="mt-1 text-2xl font-semibold">{tableData.length}</div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="rounded-lg border border-white/10 bg-white/5 p-4"
                  >
                    <div className="text-xs text-white/40">Execution Time</div>
                    <div className="mt-1 text-2xl font-semibold">{analytics.executionTime}</div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="rounded-lg border border-white/10 bg-white/5 p-4"
                  >
                    <div className="text-xs text-white/40">Status</div>
                    <div className="mt-1 text-2xl font-semibold text-green-400">Success</div>
                  </motion.div>
                </div>

                {/* Results Table */}
                <div className="rounded-lg border border-white/10 bg-white/5 overflow-hidden">
                  <div className="sticky top-0 flex items-center justify-between border-b border-white/10 px-4 py-3 bg-black/30 backdrop-blur-sm z-10">
                    <div className="text-sm font-medium">Results Table</div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs"
                      >
                        <FaDownload className="text-xs" />
                        <span>Export</span>
                      </motion.button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10 bg-black/30">
                          {tableData.length > 0 && Object.keys(tableData[0]).map(key => (
                            <th key={key} className="px-4 py-2 text-left text-xs font-medium text-white/40">
                              {key.charAt(0).toUpperCase() + key.slice(1)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.map((row, i) => (
                          <motion.tr
                            key={row.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="border-b border-white/5 hover:bg-white/5"
                          >
                            {Object.values(row).map((value, j) => (
                              <td key={j} className="px-4 py-2 text-sm whitespace-nowrap">
                                {typeof value === 'boolean' ? value.toString() : value}
                              </td>
                            ))}
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-white/40">
                <FaTable className="text-4xl mb-3" />
                <p className="text-sm">Execute a query to see results</p>
              </div>
            )}
          </div>
        </div>
      </Resizable>

      {/* Status Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex h-8 items-center justify-between border-t border-white/10 bg-black/30 px-6 text-xs backdrop-blur-sm"
      >
        <div className="flex items-center gap-2 text-white/40">
          <span className="flex h-2 w-2 rounded-full bg-green-500" />
          <span>Connected to: {selectedDatabase}</span>
        </div>
        <div className="flex items-center gap-4 text-white/40">
          <span>{new Date().toLocaleTimeString()}</span>
          <span>{queryHistory.length} Queries executed</span>
        </div>
      </motion.div>
    </div>
  );
}