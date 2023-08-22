//worker
import * as LCOM from "./Workers/LoadCombinationWorker";

//library
import MoaButton from "@midasit-dev/moaui/dist/Button";
import MoaDroplist from "@midasit-dev/moaui/dist/DropList";
import MoaStack from "@midasit-dev/moaui/dist/Stack";
import MoaTextField from "@midasit-dev/moaui/dist/TextField";
import MoaGrid from "@midasit-dev/moaui/dist/Grid";
import MoaTypography from "@midasit-dev/moaui/dist/Typography";
import MoaPanel from "@midasit-dev/moaui/dist/Panel";
import * as mui from "@mui/material";
import * as React from "react";
import Scrollbars from "rc-scrollbars";
import { useSnackbar } from "notistack";
import {
	makeCombData,
	processToken,
	sendData,
} from "./utils";
import { VerifyUtil } from 'midas-components';

//component
import MoaDataGrid from "@midasit-dev/moaui/dist/DataGrid";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { GridListComponents } from "./Components/GridListComponents";
import { CustomPagination } from "./Components/CustomFooterComponent";

//icon
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";


const typeValueOptions = [
	{ value: 0, label: "Add" },
	{ value: 1, label: "Envelope" },
	{ value: 2, label: "ABS" },
	{ value: 3, label: "SRSS" },
];
const activeValueOptions = ["ACTIVE", "INACTIVE"];

const defaultCombValues = {
	type: 0,
	name: "New Comb",
	number: 0,
	active: "ACTIVE",
	data: [],
};

function FormDialog() {
	const [open, setOpen] = React.useState(true);
	const handleClose = () => setOpen(false);

	const [baseUrl, setBaseUrl] = React.useState("");
	const [mapiKey, setMapiKey] = React.useState("");
	const handleOk = () => {
		window.location.search = `?redirectTo=${baseUrl}&mapiKey=${mapiKey}`;
	};

	const handleBaseUrlChange = (e) => {
		console.log(e);
		setBaseUrl(e.target.value)
	};

	const handleMapiKeyChange = (e) => {
		console.log(e);
		setMapiKey(e.target.value)
	};

	return (
		<div>
			<mui.Dialog open={open} onClose={handleClose}>
				<mui.DialogTitle>Enter URL and MAPI-Key</mui.DialogTitle>
				<mui.DialogContent>
					<MoaTypography>
						To use the plugin, <br />
						you need a base URL and an MAPI-key
					</MoaTypography>
					<br />
					<MoaTypography variant="h1">Base URL</MoaTypography>
					<MoaTextField
						autoFocus
						margin="dense"
						id="baseurl"
						placeholder="ex) https://api-beta.midasit.com"
						type="email"
						fullWidth
						variant="standard"
						onChange={handleBaseUrlChange}
					/>
					<div style={{ height: "1rem" }} />
					<MoaTypography variant="h1">MAPI-Key</MoaTypography>
					<MoaTextField
						id="mapikey"
						type="email"
						fullWidth
						variant="standard"
						onChange={handleMapiKeyChange}
					/>
				</mui.DialogContent>
				<mui.DialogActions>
					<MoaButton onClick={handleOk}>OK</MoaButton>
					<MoaButton onClick={handleClose}>CANCEL</MoaButton>
				</mui.DialogActions>
			</mui.Dialog>
		</div>
	);
}

function App() {
	return <Main />;
}

function Main() {
	const ref = React.useRef({});
	const { enqueueSnackbar } = useSnackbar();

	const [lcomList, setLcomList] = React.useState([]);
	const [userLcomList, setUserLcomList] = React.useState([]);
	const [requestData, setRequestData] = React.useState(false);

	const [numberPadLeft, setNumberPadLeft] = React.useState(1);

	//States
	const [combData, setCombData] = React.useState([]);
	const [combActive, setCombActive] = React.useState(defaultCombValues.active);
	const [combType, setCombType] = React.useState(defaultCombValues.type);
	const [combName, setCombName] = React.useState(defaultCombValues.name);
	const [combNameLocked, setCombNameLocked] = React.useState(false);
	const [combNumber, setCombNumber] = React.useState(defaultCombValues.number);
	const [openFormDlg, setOpenFormDlg] = React.useState(false);

	const isPortrate = mui.useMediaQuery('(orientation: portrait)');

	const loadLcom = React.useCallback(async () => {
		const result = await LCOM.DataRawLoader({ user: userLcomList });
		if (!result) return;
		setLcomList(result);
	}, [userLcomList]);

	React.useEffect(() => {
		if (!VerifyUtil.isExistQueryStrings('redirectTo') && !VerifyUtil.isExistQueryStrings('mapiKey')) {
			setOpenFormDlg(true);
		}
	}, []);

	React.useEffect(() => {
		if (VerifyUtil.isExistQueryStrings('mapiKey')) loadLcom();
	}, [loadLcom]);

	React.useEffect(() => {
		try {
			if (VerifyUtil.isExistQueryStrings('mapiKey')) {
				const newLcomList = [...lcomList];
				if (newLcomList.length > 0) {
					const lcomListLength = newLcomList.length;
					const lastItem = newLcomList[lcomListLength - 1];
					const lastItemNumber = lastItem.key * 1 + 1;
					setCombNumber(lastItemNumber);
					setNumberPadLeft(String(lcomListLength).length);
				}
			}
		} catch (_) {}
	}, [lcomList, userLcomList]);

	const setCombValue = React.useCallback((props) => {
		const { name, type, number, active, locked } = props;
		setCombName(name);
		setCombType(type);
		setCombNumber(number);
		setCombActive(active);
		setCombNameLocked(locked);

		if (props?.data) setCombData(props?.data);
	}, []);

	setCombValue.defaultProps = defaultCombValues;

	const handleEdit = React.useCallback((params) => {
		let combValue = { data: [] };

		try {
			const vComb = params.row.vCOMB;
			combValue.data = vComb.map((value) => makeCombData(value));

			let name = params.row.NAME;
			combValue.name = name;
			combValue.type = params.row.iTYPE;
			combValue.number = params.row.key;
			combValue.active = params.row.ACTIVE;
			combValue.locked = true;
		} catch (_) {
			console.log(_);
		}

		setCombValue(combValue);
	}, []);

	const handleCopy = React.useCallback(
		(params) => {
			let combValue = { data: [] };

			try {
				const vCombData = params.row.vCOMB;
				combValue.data = vCombData.map((value) => makeCombData(value));

				const rawName = params.row.NAME;
				let newCombName = processToken({ name: rawName });

				combValue.name = newCombName;
				combValue.type = params.row.iTYPE;
				combValue.number = lcomList.length + 1;
				combValue.active = params.row.ACTIVE;
			} catch (_) {
				console.log(_);
			}

			setCombValue(combValue);
		},
		[lcomList.length, setCombValue]
	);

	const handleRemove = React.useCallback(
		(params) => {
			let newUserLcomList = [...userLcomList];
			const findResult = newUserLcomList.findIndex(
				(value) => value.key === params.row.key
			);
			const newCombData = { ...params.row, markAsRemoved: true };
			if (findResult !== -1) newUserLcomList[findResult] = newCombData;
			else newUserLcomList.push(newCombData);

			setUserLcomList(newUserLcomList);
		},
		[userLcomList]
	);

	const initializeCombInput = React.useCallback(() => {
		setCombValue(defaultCombValues);
	}, []);

	const refreshLocalComponent = React.useCallback(() => {
		// ref.current.init();
		loadLcom();
		initializeCombInput();
	}, [initializeCombInput, loadLcom]);

	const handleNew = React.useCallback(() => {
		refreshLocalComponent();
		setCombNumber(defaultCombValues.number);
	}, [refreshLocalComponent]);

	const handleRefreshData = React.useCallback(() => {
		setUserLcomList([]);
		// ref.current.init();
		initializeCombInput();
	}, [initializeCombInput]);

	const handleRegisterLcom = React.useCallback(() => {
		if (combData.length === 0) {
			enqueueSnackbar("No Load Case(s) in New Combination Panel.", {
				variant: "error",
			});
			return;
		}

		const newUserLcomList = [...userLcomList];

		let userLcomListItem = {
			key: String(combNumber),
			NAME: combName,
			ACTIVE: combActive,
			iTYPE: combType,
		};

		userLcomListItem.vCOMB = combData.map((value) => {
			const name = value.NAME;

			const startIdx = name.lastIndexOf("(");
			const endIdx = name.lastIndexOf(")");

			const analysisType = name.substring(startIdx + 1, endIdx);
			const loadCaseName = name.substring(0, startIdx);

			return { ANAL: analysisType, LCNAME: loadCaseName, FACTOR: value.FACTOR };
		});

		newUserLcomList.push(userLcomListItem);
		setUserLcomList(newUserLcomList);
		refreshLocalComponent();
	}, [
		combActive,
		combData,
		combName,
		combNumber,
		combType,
		enqueueSnackbar,
		refreshLocalComponent,
		userLcomList,
	]);

	const appendCombData = React.useCallback(
		(items) => {
			//test is Array
			let newCombData = [...combData];
			for (const item of items) {
				const findResult = newCombData.findIndex(
					(value) => value.NAME === item.NAME
				);
				if (findResult === -1) newCombData.push(item);
			}

			setCombData(newCombData);
		},
		[combData]
	);

	const handleReflectDataIntoCivil = React.useCallback(() => {
		const awaiter = async () => {
			const dataObject = {
				Assign: {},
			};

			for (const value of lcomList) {
				dataObject["Assign"][value.key] = { ...value };
			}

			const bodyString = JSON.stringify(dataObject);
			const targetUrl = "/db/LCOM-GEN";
			await sendData(targetUrl, bodyString, "PUT");
		};

		awaiter();
	}, [lcomList]);

	const handleOnCellEditCommit = (params, event) => {
		let newCombData = [...combData];
		const findResult = newCombData.findIndex(
			(value) => value.NAME === params.id
		);

		let value = "";
		if (params.field === "FACTOR") {
			value = Number(event.target.value);
			if (findResult === -1 || isNaN(value)) return;
		}

		newCombData[findResult][params.field] = value;
		setCombData(newCombData);
	};

	const LcomListGridDef = React.useMemo(
		() => [
			{
				field: "key",
				headerName: "No.",
				editable: false,
				valueFormatter: ({ value }) => value.padStart(numberPadLeft, "0"),
				flex: 0.1,
			},
			{
				field: "NAME",
				headerName: "Name",
				editable: false,
				flex: 1,
			},
			{
				field: "ACTIVE",
				headerName: "Active",
				type: "singleSelect",
				valueOptions: activeValueOptions,
				editable: false,
				sortable: false,
			},
			{
				field: "TYPE",
				headerName: "Type",
				type: "singleSelect",
				editable: false,
				sortable: false,
				valueOptions: typeValueOptions,
				valueGetter: (params) =>
					typeValueOptions.find((type) => type.value === params.row.iTYPE)
						.value,
			},
			{
				field: "DESC",
				headerName: "Description",
				editable: false,
				sortable: false,
			},
			{
				field: "Actions",
				headerName: "Actions",
				type: "actions",
				editable: false,
				sortable: false,
				flex: 1,
				getActions: (params) => [
					<GridActionsCellItem
						icon={<EditIcon />}
						label="Edit"
						onClick={() => handleEdit(params)}
					/>,
					<GridActionsCellItem
						icon={<ContentCopyIcon />}
						label="Copy"
						onClick={() => handleCopy(params)}
					/>,
					<GridActionsCellItem
						icon={<DeleteIcon />}
						label="Remove"
						onClick={() => handleRemove(params)}
					/>,
				],
			},
		],
		[handleCopy, handleEdit, handleRemove, numberPadLeft]
	);

	const AllGridDef = React.useMemo(
		() => [
			{
				field: "NAME",
				headerName: "Load Cases",
				editable: false,
				flex: 1,
			},
			{
				field: "FACTOR",
				headerName: "Factor",
				editable: true,
				flex: 0.5,
			},
			{
				field: "Delete",
				headerName: "Delete",
				type: "actions",
				editable: false,
				sortable: false,
				getActions: (params) => [
					<GridActionsCellItem
						icon={<DeleteIcon />}
						label="Remove"
						onClick={() => {
							let newCombData = [...combData];
							const targetIdx = newCombData.findIndex(
								(value) => value.NAME === params.id
							);
							newCombData.splice(targetIdx, 1);
							setCombData(newCombData);
						}}
					/>,
				],
			},
		],
		[combData]
	);

	return (
		<div style={{width:"100%", display: "flex", justifyContent: "center"}}>
			{openFormDlg === true ? (
				<FormDialog />
			) : (
				<MoaStack width="100%" maxWidth="712px">
					<MoaStack marginX={2}>
						<GridListComponents
							dataRequested={requestData}
							setDataRequested={setRequestData}
							updateCombData={appendCombData}
							additionalData={{ LCOM: userLcomList }}
							ref={ref}
						/>
					</MoaStack>
					<mui.Divider sx={{ my: 2 }} flexItem>
						<mui.Button
							variant="outlined"
							onClick={() => setRequestData(true)}
							startIcon={<AddIcon />}
						>
							Add Items from List
						</mui.Button>
					</mui.Divider>
					<MoaStack direction={isPortrate ? "column" : "row"} width="100%" spacing={1} justifyContent="center">
						<MoaStack direction="column" width={isPortrate? "100%" : "48%"}>
							<Scrollbars
								autoHide
								autoHeightMax="330px"
								autoHeight
							>
								<MoaDataGrid
									initialState={{
										filter: {
											filterModel: {
												items: [
													{
														columnField: "KIND",
														operator: "equals",
														value: "GEN",
													},
												],
											},
										},
										columns: {
											columnVisibilityModel: {
												KIND: false,
											},
										},
									}}
									rows={lcomList}
									columns={LcomListGridDef}
									getRowId={(row) => row.key}
									density="compact"
									disableColumnMenu
									sx={{ width: "100%", height: "330px" }}
									experimentalFeatures={{ newEditingApi: true }}
									hideFooter
								/>
							</Scrollbars>
							<MoaStack display="flex" flexDirection="row" justifyContent="center">
								<MoaButton onClick={handleReflectDataIntoCivil}>
									Send data to civil
								</MoaButton>
								<MoaButton onClick={handleRefreshData}>
									Refresh All Data
								</MoaButton>
							</MoaStack>
						</MoaStack>
						<MoaStack direction="column" width={isPortrate? "100%" : "48%"}>
							<MoaStack direction="row" width="100%" spacing={1} paddingBottom={1}>
								<MoaTextField
									id="NumberField"
									title="No."
									titlePosition="label"
									variant="standard"
									disabled
									value={combNumber}
								/>
								<MoaTextField
									id="NameField"
									title="Name"
									titlePosition="label"
									variant="standard"
									value={combName}
									disabled={combNameLocked}
									onChange={(e) => setCombName(e.target.value)}
								/>
							</MoaStack>
							<MoaStack direction="row" spacing={1} paddingBottom={1} width="100%" justifyContent="space-between" alignItems="center">
								<MoaStack direction="row" spacing={1} width="50%" alignItems="center">
									<MoaTypography>Active</MoaTypography>
									<MoaDroplist
										width="100%"
										title="Active"
										itemList={() => {
											let map = new Map();
											for (const value of activeValueOptions) {
												map.set(value, value);
											}
											return map;
										}}
										value={combActive}
										onChange={(e) => setCombActive(e.target.value)}		
									/>
								</MoaStack>
								<MoaStack direction="row" spacing={1} width="50%" alignItems="center">
									<MoaTypography>Type</MoaTypography>
									<MoaDroplist
										width="100%"
										title="Type"
										itemList={() => {
											let map = new Map();
											for (const value of typeValueOptions) {
												map.set(value.label, value.value);
											}
											return map;
										}}
										value={combType}
										onChange={(e) => setCombType(e.target.value)}
									/>
								</MoaStack>
							</MoaStack>
							<Scrollbars
								autoHide
								autoHeight
								autoHeightMax={"257px"}
								style={{ width: "100%" }}
							>
								<MoaDataGrid
									rows={combData}
									columns={AllGridDef}
									getRowId={(row) => row.NAME}
									density="compact"
									disableColumnMenu
									sx={{ minWidth: "40%", height: "257px" }}
									onCellEditStop={handleOnCellEditCommit}
									experimentalFeatures={{ newEditingApi: true }}
									hideFooter
								/>
							</Scrollbars>
							<MoaStack display="flex" flexDirection="row" justifyContent="center">
								<MoaButton onClick={handleNew}>New</MoaButton>
								<MoaButton onClick={handleRegisterLcom}>Registration</MoaButton>
							</MoaStack>
						</MoaStack>
					</MoaStack>
				</MoaStack>
			)}
		</div>
	);
}

export default Main;