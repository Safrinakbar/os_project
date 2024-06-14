import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [numProcesses, setNumProcesses] = useState(0);
  const [numResources, setNumResources] = useState(0);
  const [available, setAvailable] = useState([]);
  const [allocation, setAllocation] = useState([]);
  const [max, setMax] = useState([]);
  const [need, setNeed] = useState([]);
  const [sequence, setSequence] = useState([]);
  const [isSafe, setIsSafe] = useState(false);
  const [requestProcess, setRequestProcess] = useState(0);
  const [requestResources, setRequestResources] = useState([]);

  useEffect(() => {
    initializeMatrices();
  }, [numProcesses, numResources]);

  const initializeMatrices = () => {
    setAllocation(Array.from({ length: numProcesses }, () => Array(numResources).fill(0)));
    setMax(Array.from({ length: numProcesses }, () => Array(numResources).fill(0)));
    setNeed(Array.from({ length: numProcesses }, () => Array(numResources).fill(0)));
    setAvailable(Array(numResources).fill(0));
    setRequestResources(Array(numResources).fill(0));
  };

  const calculateNeedMatrix = () => {
    const newNeed = allocation.map((allocRow, i) =>
      allocRow.map((allocValue, j) => max[i][j] - allocValue)
    );
    setNeed(newNeed);
  };

  const handleCalculateSafeSequence = () => {
    calculateNeedMatrix();
    const work = [...available];
    const finish = Array(numProcesses).fill(false);
    const newSequence = [];
    let count = 0;

    while (count < numProcesses) {
      let found = false;
      for (let i = 0; i < numProcesses; i++) {
        if (!finish[i]) {
          let j;
          for (j = 0; j < numResources; j++) {
            if (need[i][j] > work[j]) break;
          }
          if (j === numResources) {
            for (let k = 0; k < numResources; k++) {
              work[k] += allocation[i][k];
            }
            newSequence.push(i);
            finish[i] = true;
            count++;
            found = true;
          }
        }
      }
      if (!found) {
        setIsSafe(false);
        setSequence([]);
        return;
      }
    }
    setIsSafe(true);
    setSequence(newSequence);
  };

  const handleRequestResources = () => {
    const processIndex = requestProcess;

    // Check if the request can be granted
    for (let i = 0; i < numResources; i++) {
      if (requestResources[i] > need[processIndex][i] || requestResources[i] > available[i]) {
        alert('Request cannot be granted');
        return;
      }
    }

    // Temporarily allocate the requested resources
    const tempAvailable = [...available];
    const tempAllocation = [...allocation];
    const tempNeed = [...need];

    for (let i = 0; i < numResources; i++) {
      tempAvailable[i] -= requestResources[i];
      tempAllocation[processIndex][i] += requestResources[i];
      tempNeed[processIndex][i] -= requestResources[i];
    }

    // Check if the system is still in a safe state
    const work = [...tempAvailable];
    const finish = Array(numProcesses).fill(false);
    const newSequence = [];
    let count = 0;

    while (count < numProcesses) {
      let found = false;
      for (let i = 0; i < numProcesses; i++) {
        if (!finish[i]) {
          let j;
          for (j = 0; j < numResources; j++) {
            if (tempNeed[i][j] > work[j]) break;
          }
          if (j === numResources) {
            for (let k = 0; k < numResources; k++) {
              work[k] += tempAllocation[i][k];
            }
            newSequence.push(i);
            finish[i] = true;
            count++;
            found = true;
          }
        }
      }
      if (!found) {
        alert('Request cannot be granted as it leads to an unsafe state');
        return;
      }
    }

    // Grant the request
    setAvailable(tempAvailable);
    setAllocation(tempAllocation);
    setNeed(tempNeed);
    alert('Request granted successfully');
  };

  return (
    <div className="App">
      <h1>Banker's Algorithm</h1>
      <div>
        <label>
          Number of Processes:
          <input
            type="number"
            value={numProcesses}
            onChange={(e) => setNumProcesses(parseInt(e.target.value))}
          />
        </label>
        <label>
          Number of Resources:
          <input
            type="number"
            value={numResources}
            onChange={(e) => setNumResources(parseInt(e.target.value))}
          />
        </label>
        <button onClick={initializeMatrices}>Initialize Matrices</button>
      </div>

      <div>
        <h2>Available Resources</h2>
        <div>
          {Array.from({ length: numResources }, (_, j) => (
            <input
              key={j}
              type="number"
              value={available[j] || 0}
              onChange={(e) => {
                const newAvailable = [...available];
                newAvailable[j] = parseInt(e.target.value);
                setAvailable(newAvailable);
              }}
            />
          ))}
        </div>

        <h2>Allocation Matrix</h2>
        {Array.from({ length: numProcesses }, (_, i) => (
          <div key={i}>
            {Array.from({ length: numResources }, (_, j) => (
              <input
                key={j}
                type="number"
                value={allocation[i]?.[j] || 0}
                onChange={(e) => {
                  const newAllocation = [...allocation];
                  newAllocation[i][j] = parseInt(e.target.value);
                  setAllocation(newAllocation);
                }}
              />
            ))}
          </div>
        ))}

        <h2>Max Matrix</h2>
        {Array.from({ length: numProcesses }, (_, i) => (
          <div key={i}>
            {Array.from({ length: numResources }, (_, j) => (
              <input
                key={j}
                type="number"
                value={max[i]?.[j] || 0}
                onChange={(e) => {
                  const newMax = [...max];
                  newMax[i][j] = parseInt(e.target.value);
                  setMax(newMax);
                }}
              />
            ))}
          </div>
        ))}
      </div>

      <button onClick={calculateNeedMatrix}>Calculate Need Matrix</button>
      <button onClick={handleCalculateSafeSequence}>Check Safe Sequence</button>

      <h2>Need Matrix</h2>
      {need.map((needRow, i) => (
        <div key={i}>
          {needRow.map((needValue, j) => (
            <input
              key={j}
              type="number"
              value={needValue}
              readOnly
            />
          ))}
        </div>
      ))}

      {isSafe && (
        <div>
          <h2>System is in a safe state</h2>
          <h3>Safe Sequence:</h3>
          <p>{sequence.join(', ')}</p>
        </div>
      )}
      {!isSafe && sequence.length > 0 && <h2>System is not in a safe state</h2>}

      <div>
        <h2>Request Resources</h2>
        <label>
          Process Index:
          <input
            type="number"
            value={requestProcess}
            onChange={(e) => setRequestProcess(parseInt(e.target.value))}
          />
        </label>
        {Array.from({ length: numResources }, (_, j) => (
          <input
            key={j}
            type="number"
            value={requestResources[j] || 0}
            onChange={(e) => {
              const newRequestResources = [...requestResources];
              newRequestResources[j] = parseInt(e.target.value);
              setRequestResources(newRequestResources);
            }}
          />
        ))}
        <button onClick={handleRequestResources}>Request Resources</button>
      </div>
    </div>
  );
}

export default App;
