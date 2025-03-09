"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaTerminal, FaCog, FaDatabase, FaTable, FaSearch, FaCode, FaClock, FaServer, FaChartBar } from 'react-icons/fa';
import { Resizable } from 're-resizable';
import BACKEND_URL from '../config';

type QueryResult = {
  timestamp: string;
  query: string;
  result: string;
  status: 'success' | 'error';
};

type TableData = {
  columns: string[];
  rows: (string | number | boolean | null)[][];
};

// Add this gradient background component
const GradientBackground = () => (
  <div className="absolute inset-0 -z-10">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(0,0,0,0))]" />
  </div>
);

export default function EditorPage() {
  const [code, setCode] = useState(`// Example query:
{
  "users": {
    "select": ["id", "name", "email", "status"],
    "status": "active",
    "limit": 10
  }
}`);
  
  const [consoleWidth, setConsoleWidth] = useState(400);
  const [dashboardHeight, setDashboardHeight] = useState(300);
  const [queryHistory, setQueryHistory] = useState<QueryResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedDatabase, setSelectedDatabase] = useState('postgres');
  const [tableData, setTableData] = useState<TableData>({
    columns: ['id', 'name', 'email', 'status', 'last_login', 'is_active', 'score'],
    rows: [
      [1, "John Doe", "john@example.com", "premium", "2024-03-15T10:30:00", true, 95.5],
      [2, "Jane Smith", "jane@example.com", "basic", "2024-03-14T15:45:00", true, 88.0],
      [3, "Bob Wilson", "bob@example.com", "premium", "2024-03-13T09:20:00", false, 76.8],
      [4, "Alice Brown", "alice@example.com", "trial", "2024-03-15T11:15:00", true, 92.3],
      [5, "Charlie Davis", "charlie@example.com", "basic", "2024-03-12T16:50:00", true, 85.7],
      [6, "Eva Martinez", "eva@example.com", "premium", null, false, 79.9],
      [7, "David Clark", "david@example.com", "basic", "2024-03-14T14:25:00", true, 91.2],
      [8, "Grace Lee", "grace@example.com", "trial", "2024-03-15T08:40:00", true, 88.6],
      [9, "Frank Johnson", "frank@example.com", "premium", "2024-03-13T13:10:00", false, 82.4],
      [10, "Helen White", "helen@example.com", "basic", "2024-03-15T09:55:00", true, 94.1]
    ]
  });
  const consoleRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    try {
      setIsRunning(true);
      const timestamp = new Date().toLocaleTimeString();
      
      // Add query to history immediately with a pending status
      setQueryHistory(prev => [...prev, {
        timestamp,
        query: code,
        result: 'Generating optimized query...',
        status: 'success'
      }]);

      // Step 1: Send code to /generate endpoint
      const generateResponse = await fetch(`${BACKEND_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: code }),
      });
      
      if (!generateResponse.ok) {
        throw new Error(`Failed to generate query: ${generateResponse.statusText}`);
      }
      
      const responseData = await generateResponse.json();
      
      // Extract the query data from the nested structure returned by your server
      const outputJson = responseData.json || {};
      
      // Update code editor with the generated query instead of the console
      setCode(JSON.stringify(outputJson.query, null, 2));
      
      // Update query history to show we're executing the generated query
      setQueryHistory(prev => [
        ...prev.slice(0, -1),
        {
          timestamp,
          query: code,
          result: `Executing query...`,
          status: 'success'
        }
      ]); 
      
      // Step 2: Send the generated query to the endpoint
      const endpointUrl = `${BACKEND_URL}/api${outputJson.endpoint}` || `${BACKEND_URL}/api/query`;
      const endpointResponse = await fetch(endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(outputJson.query),
      });
      
      if (!endpointResponse.ok) {
        throw new Error(`Failed to execute query: ${endpointResponse.statusText}`);
      }
      
      const result = await endpointResponse.json();
      
      // Parse result into tabular format if it's an array of objects
      if (Array.isArray(result)) {
        const firstRow = result[0];
        if (firstRow && typeof firstRow === 'object') {
          const columns = Object.keys(firstRow);
          const rows = result.map(item => columns.map(col => item[col]));
          setTableData({ columns, rows });
        }
      }

      // Step 3: Update query history with the result
      setQueryHistory(prev => [
        ...prev.slice(0, -1),
        {
          timestamp,
          query: "Executed query successfully",
          result: JSON.stringify(result, null, 2),
          status: 'success'
        }
      ]);
    } catch (error) {
      // Handle errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setTableData({
        columns: ['Error'],
        rows: [[`Error: ${errorMessage}`]]
      });
      
      setQueryHistory(prev => {
        if (prev.length === 0) {
          return [{
            timestamp: new Date().toLocaleTimeString(),
            query: code,
            result: `Error: ${errorMessage}`,
            status: 'error'
          }];
        }
        return [
          ...prev.slice(0, -1),
          {
            timestamp: prev[prev.length - 1].timestamp,
            query: code,
            result: `Error: ${errorMessage}`,
            status: 'error'
          }
        ];
      });
    } finally {
      setIsRunning(false);
      // Scroll console to bottom
      if (consoleRef.current) {
        consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
      }
    }
  };

  // Extract available databases from schema (could be fetched from server)
  const availableDatabases = ['postgres', 'analytics', 'users_db'];

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
              {availableDatabases.map(db => (
                <option key={db} value={db}>{db}</option>
              ))}
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
      <div className="flex flex-1 overflow-hidden">
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
              <span>query.json</span>
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

      {/* Draggable Dashboard */}
      <Resizable
        size={{ width: '100%', height: dashboardHeight }}
        onResizeStop={(e, direction, ref, d) => {
          setDashboardHeight(dashboardHeight + d.height);
        }}
        minHeight={200}
        maxHeight={800}
        enable={{ top: true }}
        className="relative border-t border-white/10 bg-black/30 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-full flex flex-col"
        >
          <div className="flex h-10 items-center justify-between border-b border-white/10 px-4">
            <div className="flex items-center gap-2 text-sm">
              <FaChartBar className="text-purple-400" />
              <span>Data Dashboard</span>
            </div>
            {tableData && (
              <span className="text-xs text-white/40">
                {tableData.rows.length} rows × {tableData.columns.length} columns
              </span>
            )}
          </div>
          <div className="flex-1 overflow-auto p-4">
            {tableData ? (
              <div className="rounded-lg border border-white/10">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5">
                        {tableData.columns.map((column, index) => (
                          <th
                            key={index}
                            className="whitespace-nowrap px-4 py-2 text-left text-sm font-medium text-white/80"
                          >
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.rows.map((row, rowIndex) => (
                        <tr
                          key={rowIndex}
                          className="border-b border-white/5 last:border-0 hover:bg-white/5"
                        >
                          {row.map((cell: string | number | boolean | null, cellIndex: number) => (
                            <td
                              key={cellIndex}
                              className="whitespace-nowrap px-4 py-2 text-sm text-white/60"
                            >
                              {JSON.stringify(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-white/40">
                No data to display. Run a query to see results in tabular format.
              </div>
            )}
          </div>
        </motion.div>
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