import React, { useEffect, useState } from "react";
import { Formik } from "formik";
import {
	Button,
	InputLabel,
	MenuItem,
	Select,
	TextField,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	Grid,
} from "@mui/material";
import { getLocations, isNameValid } from "./mock-api/apis";

export default function Form() {
	const [formValues, setFormValues] = useState([]); // Stores the entered values in the form
	const [locations, setLocations] = useState([]); // Stores the available locations
	const [nameError, setNameError] = useState(""); // Manages errors related to the name input
	const [isNameAvailable, setIsNameAvailable] = useState(true); // Indicates if the entered name is available
	const [isNameChecking, setIsNameChecking] = useState(false); // Indicates if the name is being checked for availability
	const [isNameChosen, setIsNameChosen] = useState(false); // Indicates if the entered name has been chosen before

	useEffect(() => {
		// Fetches the list of available locations when the component mounts
		getLocations().then((locations) => {
			setLocations(locations);
		});
	}, []);

	const validateName = async (name) => {
		if (!name) {
			// Displays an error if the name field is empty
			setNameError("Please enter a name");
			setIsNameAvailable(true);
			return;
		}
		try {
			setIsNameChecking(true); // Shows that the name is being checked for availability
			const isValid = await isNameValid(name); // Checks if the entered name is valid
			setNameError(isValid ? "" : "This name is already taken");
			setIsNameAvailable(isValid);
			setIsNameChosen(formValues.some((item) => item.name === name)); // Checks if the name has been chosen before
		} catch (error) {
			console.error(error);
			setNameError("Error validating name");
			setIsNameAvailable(false);
		} finally {
			setIsNameChecking(false); // Indicates that the name availability check is complete
		}
	};

	return (
		<Formik
			initialValues={{ name: "", location: "" }} // Sets initial values for the form fields
			validate={(values) => {
				const errors = {};
				if (!values.name) {
					errors.name = "Please enter a name";
				}
				if (!values.location) {
					errors.location = "Please select a location";
				}
				return errors;
			}}
			onSubmit={async (values, { setSubmitting, resetForm, errors }) => {
				try {
					if (!isNameAvailable || (errors && Object.keys(errors).length !== 0)) {
						// Prevents form submission if the name is not available or there are validation errors
						return;
					}
					setFormValues([
						...formValues,
						{ name: values.name, location: values.location }, // Adds the entered values to the list of form values
					]);
					resetForm(); // Resets the form fields after submission
				} finally {
					setSubmitting(false); // Indicates that form submission is complete
				}
			}}
		>
			{({
				values,
				errors,
				handleChange,
				handleBlur,
				handleSubmit,
				isSubmitting,
			}) => (
				<form onSubmit={handleSubmit}>
					<Grid container spacing={2}>
						{/* Name */}
						<Grid item xs={12}>
							<InputLabel htmlFor="name">Name</InputLabel>
							<TextField
								id="name"
								name="name"
								type="text"
								value={values.name}
								onChange={(e) => {
									handleChange(e);
									validateName(e.target.value);
								}}
								onBlur={handleBlur}
								error={!!nameError}
								helperText={nameError}
								fullWidth
							/>
							{nameError && isNameChecking && (
								// Displays "Checking name..." if the name is being validated
								<div style={{ color: "orange", fontSize: "0.8rem" }}>
									Checking name...
								</div>
							)}
							{isNameChosen && (
								// Indicates if the name has been chosen before
								<div style={{ color: "red", fontSize: "0.8rem" }}>
									This name has been chosen before
								</div>
							)}
						</Grid>

						{/* Location */}
						<Grid item xs={12}>
							<InputLabel htmlFor="location">Location</InputLabel>
							<Select
								id="location"
								name="location"
								value={values.location}
								onChange={handleChange}
								onBlur={handleBlur}
								error={!!errors.location}
								fullWidth
							>
								<MenuItem value="" disabled>
									Select Location
								</MenuItem>
								{locations.map((location) => (
									<MenuItem key={location} value={location}>
										{location}
									</MenuItem>
								))}
							</Select>
						</Grid>
					</Grid>

					{/* Buttons */}
					<div
						style={{
							marginTop: "15em",
							display: "flex",
							justifyContent: "flex-end",
						}}
					>
						<Button
							type="button"
							onClick={() => setFormValues([])}
							variant="outlined"
						>
							Clear
						</Button>
						<Button
							type="submit"
							disabled={
								isSubmitting ||
								!!nameError ||
								!!errors.location ||
								!isNameAvailable ||
								isNameChosen
							}
							variant="contained"
							style={{ marginLeft: "10px" }}
						>
							Add
						</Button>
					</div>

					<Table style={{ marginTop: "20px" }}>
						<TableHead>
							<TableRow style={{ background: "#ccc", color: "#fff" }}>
								<TableCell style={{ fontWeight: "bold" }}>Name</TableCell>
								<TableCell style={{ fontWeight: "bold" }}>Location</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{formValues.map((item) => (
								<TableRow key={item.name} style={{ background: "#fff" }}>
									<TableCell>{item.name}</TableCell>
									<TableCell>{item.location}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</form>
			)}
		</Formik>
	);
}
