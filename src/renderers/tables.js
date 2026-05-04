export function renderTables(content) {
  const lines = content.split('\n');
  const result = [];
  let inTable = false;
  let tableHeaders = [];
  let tableRows = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.match(/^\|.+\|$/)) {
      if (!inTable) {
        inTable = true;
        tableHeaders = [];
        tableRows = [];
        result.push('<table>');
      }
      const cells = line.split('|').filter(c => c.trim());
      if (lines[i + 1] && lines[i + 1].match(/^[\|\s:-]+$/)) {
        tableHeaders = cells;
        i++;
        result.push('<thead><tr>' + tableHeaders.map(h => `<th>${h.trim()}</th>`).join('') + '</tr></thead><tbody>');
      } else {
        tableRows.push('<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>');
      }
    } else if (inTable && !(line.match(/^\|.+\|$/) || (lines[i - 1] && lines[i - 1].match(/^^[\|\s:-]+$/)))) {
      inTable = false;
      result.push(tableRows.join('') + '</tbody></table>');
      result.push(line);
    } else {
      result.push(line);
    }
  }

  return result.join('\n');
}

export default renderTables;