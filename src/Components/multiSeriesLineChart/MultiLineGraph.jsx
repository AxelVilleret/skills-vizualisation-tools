import React, { useState, useEffect } from "react";
import {
	Chart as ChartJS,
	LineElement,
	CategoryScale,
	LinearScale,
	PointElement,
	Tooltip,
	Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Container, Row, Col, Form, InputGroup, Button } from "react-bootstrap";
import zoomPlugin from "chartjs-plugin-zoom";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { fetchData } from "../../Services/FetchDataService";

ChartJS.register(
	LineElement,
	CategoryScale,
	LinearScale,
	PointElement,
	Tooltip,
	Legend,
	zoomPlugin
);

function MultiLineGraph({ setSelectedDate, selectedSkil, setSelectedSkil }) {
	const [data, setData] = useState([]);

	const [selectedSkill, setSelectedSkill] = useState(undefined);
	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);
	const [focusedInput, setFocusedInput] = useState(null);
	const [showCoverLine, setShowCoverLine] = useState(true); // State for the checkbox

	const zoomOptions = {
		zoom: {
			drag: {
				enabled: true,
			},
			wheel: {
				enabled: true,
			},
			pinch: {
				enabled: true,
			},
			mode: "xy",
		},
	};
	const options = {
		scales: {
			y: {
				beginAtZero: true,
			},
		},
		plugins: {
			zoom: zoomOptions,
		},
		onClick: function (evt, elements) {
			if (elements.length > 0) {
				const index = elements[0].index;
				const formattedData = formatDataForChart(
					data.find((skill) => skill.name === selectedSkill)?.updates || []
				);
				if (setSelectedDate) setSelectedDate(formattedData.labels[index]);
			}
		},
	};

	useEffect(() => {
		const fetchDataAsync = async () => {
			try {
				const result = await fetchData();
				setData(result);
				if (result.length > 0) {
					setSelectedSkill(result[0].name);
					setSelectedSkil(result[0].name);
				}

			} catch (error) {
				console.error("error", error);
			}
		};

		fetchDataAsync();
	}, []);

	useEffect(() => {
		if (selectedSkil) {
			setSelectedSkill(selectedSkil);
		}
	}, [selectedSkil]);

	const formatDataForChart = (dataUpdates) => {
		const filteredData = dataUpdates.filter(
			(update) =>
				(!startDate || new Date(update.timestamp) >= startDate) &&
				(!endDate || new Date(update.timestamp) <= endDate)
		);

		const formattedData = {
			labels: filteredData.map((update) => update.timestamp),
			datasets: [
				{
					label: "Maitrise",
					data: filteredData.map((update) => update.mastery),
					backgroundColor:
						JSON.parse(localStorage.getItem("color-palette")) || "#034C65",
					borderColor:
						JSON.parse(localStorage.getItem("color-palette")) || "#034C65",
					tension: 0.4,
				},

				{
					label: "Couverture",
					data: filteredData.map((update) =>
						showCoverLine ? update.cover : null
					),
					backgroundColor:
						JSON.parse(localStorage.getItem("color-palette")) || "#FF865A",
					borderColor:
						JSON.parse(localStorage.getItem("color-palette")) || "#034C65",
					tension: 0.4,
					hidden: !showCoverLine,
				},

				{
					label: "Borne supérieure de l'intervalle de confiance",
					data: filteredData.map(
						(update) => update.mastery + update.trust * 0.08
					),
					backgroundColor: "rgba(0, 123, 255, 0.3)",
					borderColor: "rgba(0, 123, 255, 0.7)",
					borderWidth: 1,
					type: "line",
					fill: "+1",
					tension: 0.1,
				},
				{
					label: "Borne inférieure de l'intervalle de confiance",
					data: filteredData.map(
						(update) => update.mastery - update.trust * 0.08
					),
					backgroundColor: "rgba(0, 123, 255, 0.3)",
					borderColor: "rgba(0, 123, 255, 0.7)",
					borderWidth: 1,
					type: "line",
					fill: "-1",
				},
			],
		};
		return formattedData;
	};

	const handleSkillChange = (event) => {
		setSelectedSkill(event.target.value);
		setSelectedSkil(event.target.value);
	};

	const handleStartDateChange = (date) => {
		setStartDate(date);
		setFocusedInput("endDate");
	};

	const handleEndDateChange = (date) => {
		setEndDate(date);
		setFocusedInput(null);
	};

	const handleCheckboxChange = () => {
		setShowCoverLine(!showCoverLine); // Toggle the state when the checkbox is clicked
	};

	const containerStyle = {
		display: "flex",
		alignItems: "flex-end",
		justifyContent: "start",
	};

	return (
		<Container>
			<Row>
				<Col md={6}>
					{/* Dropdown to select skill */}
					<Form>
						<Form.Group controlId="selectSkill" className="formSelect">
							<Row>
								<Col>
									<Form.Label>Sélectionner une compétence</Form.Label>
								</Col>
							</Row>
							<Row>
								<Col>
									<Form.Control
										as="select"
										value={selectedSkill}
										onChange={handleSkillChange}
									>
										{data.map((skill) => (
											<option key={skill.name} value={skill.name}>
												{skill.name}
											</option>
										))}
									</Form.Control>
								</Col>
							</Row>
						</Form.Group>
					</Form>
				</Col>

				<Col md={3}>
					{/* Date Picker for start date */}
					<Form>
						<Form.Group controlId="startDate">
							<Row>
								<Col>
									<Form.Label>Date de début</Form.Label>
								</Col>
							</Row>
							<Row>
								<Col>
									<DatePicker
										selected={startDate}
										onChange={handleStartDateChange}
										onFocus={() => setFocusedInput("startDate")}
										open={focusedInput === "startDate"}
										placeholderText="2023-01-01"
										className="form-control"
										dateFormat="yyyy-MM-dd"
									/>
								</Col>
							</Row>
						</Form.Group>
					</Form>
				</Col>
				<Col md={3}>
					{/* Date Picker for start date */}
					<Form>
						<Form.Group controlId="endDate">
							<Row>
								<Col>
									<Form.Label>Date de fin</Form.Label>
								</Col>
							</Row>
							<Row>
								<Col>
									<DatePicker
										selected={endDate}
										onChange={handleEndDateChange}
										onFocus={() => setFocusedInput("endDate")}
										open={focusedInput === "endDate"}
										placeholderText="2023-01-12"
										className="form-control"
										dateFormat="yyyy-MM-dd"
									/>
								</Col>
							</Row>
						</Form.Group>
					</Form>
				</Col>

				<Col md={12}>
					{/* Checkbox for hiding/showing the "cover" line */}
					{/* <Form.Check
						type="checkbox"
						id="showCoverLineCheckbox"
						label="  Show Cover "
						checked={showCoverLine}
						onChange={handleCheckboxChange}
					/> */}
					<div className="mt-2 mb-2">
						<FormGroup>
							<FormControlLabel
								control={
									<Switch
										defaultChecked={showCoverLine}
										onChange={handleCheckboxChange}
									/>
								}
								label="Couverture"
								style={{ fontSize: "0.8rem" }}
							/>
						</FormGroup>
					</div>
					{/* Chart component */}
					{data.length > 0 && (
						<Line
							data={formatDataForChart(
								data.find((skill) => skill.name === selectedSkill)?.updates ||
								[]
							)}
							options={options}
							width={600}
							height={100}
						></Line>
					)}
				</Col>
			</Row>
		</Container>
	);
}

export default MultiLineGraph;
