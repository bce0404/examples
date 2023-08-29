import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { DataGrid, useGridApiContext  } from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Select from '@mui/material/Select';

//Select for Line Type in Alignments Data Grid
function SelectEditInputCell(props) {
  const { id, value, field } = props;
  const apiRef = useGridApiContext();

  const handleChange = async (event) => {
    await apiRef.current.setEditCellValue({ id, field, value: event.target.value });
    apiRef.current.stopCellEditMode({ id, field });
  };

  return (
    <Select
      value={value}
      onChange={handleChange}
      size="small"
      sx={{ height: 1 }}
      native
      autoWidth
      autoFocus
    >
      <option>Straight</option>
      <option>Arc</option>
      <option>Clothoid</option>
      <option>Cubic Parabola</option>
    </Select>
  );
}

const renderSelectEditInputCell = (params) => {
  return <SelectEditInputCell {...params} />;
};

//Column Preset
const columnPreset = {
  sortable: false,
  editable: true,
  headerAlign: 'center',
  headerHeight: 20
}

// Column setting for Alignment Data Grid
const columnWidthAlign = {
  width: 115,
}

const columnsAlign = [
  { 
    field: 'linetype',
    headerName: 'Line Types',
    renderEditCell: renderSelectEditInputCell,
    align:'center',
    ...columnPreset,
    ...columnWidthAlign
  },
  {
    field: 'linelength',
    headerName: 'Length',
    type: 'number',
    ...columnPreset,
    ...columnWidthAlign
  },
  {
    field: 'linerads',
    headerName: 'Radius Start',
    type: 'number',
    ...columnPreset,
    ...columnWidthAlign
  },
  {
    field: 'linerade',
    headerName: 'Radius End',
    type: 'number',
    ...columnPreset,
    ...columnWidthAlign
  }
];

// Column setting for Segment Data Grid
const columnWidthSegm = {
  width: 92,
}
const columnsSegm = [
  { 
    field: 'seglength',
    headerName: 'Length',
    type: 'number',
    ...columnPreset,
    ...columnWidthSegm
  },
  {
    field: 'segNumber',
    headerName: 'Nb',
    type: 'number',
    ...columnPreset,
    ...columnWidthSegm
  },
  {
    field: 'strgroup',
    headerName: 'Str. Group',
    type: 'string',
    ...columnPreset,
    ...columnWidthSegm
  },
  {
    field: 'matlid',
    headerName: 'Material ID',
    type: 'number',
    ...columnPreset,
    ...columnWidthSegm
  },
  {
    field: 'sectid',
    headerName: 'Section ID',
    type: 'number',
    ...columnPreset,
    ...columnWidthSegm
  }
];

// DataGrid ID Counter
let alignIdCounter = 0;
let segmIdCounter = 0;

//Data Grid for Alignment
export function DataGridAlign(alignGrid, setAlignGrid, AlignHelpModal) {

  function createRow() {
    alignIdCounter = alignGrid.length;
    alignIdCounter += 1;
    return {id: alignIdCounter, linetype: "Straight", linelength:30, linerads:0, linerade:0}
  }
  function addRow() {
    setAlignGrid((prevRows) => [...prevRows, createRow()]);
  }
  function removeRow() {
    setAlignGrid((prevRows) => {
      const rowToDeleteIndex = prevRows.length - 1;
      return [
        ...alignGrid.slice(0, rowToDeleteIndex),
        ...alignGrid.slice(rowToDeleteIndex + 1),
      ]
    });
  }
  const processRowUpdate = React.useCallback(
    async (newRow) => {
      const updatedRow = { ...newRow };
      setAlignGrid(alignGrid.map((row) => (row.id === newRow.id ? updatedRow : row)));
      return updatedRow;
    },
    [alignGrid, setAlignGrid]
  );
  const handleProcessRowUpdateError = React.useCallback((error) => {
    console.log("Error!");
  }, []);

  return (
    <Box sx={{marginLeft:3}}>
      <Stack direction="column" spacing={0} >
        <Stack direction="row" spacing={0}>
          <IconButton aria-label="Add" color="primary" onClick={addRow}> 
            <AddCircleOutlineIcon />
          </IconButton>
          <IconButton aria-label="Delete" color="secondary" onClick={removeRow}> 
            <RemoveCircleOutlineIcon />
          </IconButton>
          <IconButton aria-label="Help"onClick={AlignHelpModal}> 
            <HelpOutlineIcon />
          </IconButton>
        </Stack>
        <Box sx={{height:220,width:"100%"}}>
          <DataGrid
            sx={{fontSize:"14px"}}
            rows={alignGrid}
            columns={columnsAlign}
            disableColumnMenu={true}
            hideFooter={true}
            desity="compact"
            rowHeight={28}
            processRowUpdate={processRowUpdate}
            onProcessRowUpdateError={handleProcessRowUpdateError}
            columnHeaderHeight={28}
            showCellVerticalBorder
            showColumnVerticalBorder
          />
        </Box>
      </Stack>
    </Box>
  );
}

//Data Grid for Segment
export function DataGridSegm(segmGrid ,setSegmGrid, SegmHelpModal) {

  function createRow() {
    segmIdCounter = segmGrid.length;
    segmIdCounter += 1;
    return {id: segmIdCounter, seglength: 1, segNumber:30, strgroup:"Seg"+segmIdCounter, matlid:1, sectid:1}
  }
  function addRow() {
    setSegmGrid((prevRows) => [...prevRows, createRow()]);
  }
  function removeRow() {
    setSegmGrid((prevRows) => {
      const rowToDeleteIndex = prevRows.length - 1;
      return [
        ...segmGrid.slice(0, rowToDeleteIndex),
        ...segmGrid.slice(rowToDeleteIndex + 1),
      ]
    });
  }
  const processRowUpdate = React.useCallback(
    async (newRow) => {
      const updatedRow = { ...newRow };
      setSegmGrid(segmGrid.map((row) => (row.id === newRow.id ? updatedRow : row)));
      return updatedRow;
    },
    [segmGrid, setSegmGrid]
  );
  const handleProcessRowUpdateError = React.useCallback((error) => {
    console.log("Error!");
  }, []);
  
  return (
    <Box sx={{marginLeft:3}}>
      <Stack direction="column" spacing={0} >
        <Stack direction="row" spacing={0}>
          <IconButton aria-label="Add" color="primary" onClick={addRow}> 
            <AddCircleOutlineIcon />
          </IconButton>
          <IconButton aria-label="Delete" color="secondary" onClick={removeRow}> 
            <RemoveCircleOutlineIcon />
          </IconButton>
          <IconButton aria-label="Help" onClick={SegmHelpModal}> 
            <HelpOutlineIcon />
          </IconButton>
        </Stack>
        <Box sx={{height:220,width:"100%"}}>
          <DataGrid
            sx={{fontSize:"14px"}}
            rows={segmGrid}
            columns={columnsSegm}
            disableColumnMenu={true}
            hideFooter={true}
            desity="compact"
            rowHeight={28}
            processRowUpdate={processRowUpdate}
            onProcessRowUpdateError={handleProcessRowUpdateError}
            columnHeaderHeight={28}
            showCellVerticalBorder
            showColumnVerticalBorder
          />
        </Box>
      </Stack>
    </Box>
  );
}