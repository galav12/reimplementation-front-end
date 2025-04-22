import React, {useState, useEffect} from "react";
import * as Yup from 'yup';
import './Edit.css';
import { Button, Form } from 'react-bootstrap';
import axios, { AxiosError } from 'axios';
import { alertActions } from "../../store/slices/alertSlice";
import { useDispatch } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
// import { Formik, Form, Field, ErrorMessage } from 'formik';


// Define initial form values and validation schema using Yup
const Edit: React.FC = () => {
  const initialValues = {
    fullName: '',
    password: '',
    confirmPassword: '',
    email: '',
    institution: 'Other',
    actionPreference: 'cannotShowActions',
    handle: '',
    timeZone: 'GMT-05:00',
    language: 'No Preference',
    emailOptions: {
      reviewNotification: true,
      submissionNotification: true,
      metaReviewNotification: true,
    },
  };

  const validationSchema = Yup.object().shape({
    fullName: Yup.string().required('Full name is required'),
    password: Yup.string(),
    confirmPassword: Yup.string().oneOf([Yup.ref('password')], 'Passwords must match'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    handle: Yup.string().required('Handle is required'),
    institution: Yup.string().required(),
    timeZone: Yup.string().required(),
    language: Yup.string().required(),
    emailOptions: Yup.object().shape({
      reviewNotification: Yup.boolean(),
      submissionNotification: Yup.boolean(),
      metaReviewNotification: Yup.boolean(),
    }),
    actionPreference: Yup.string().required(),
  });

  const auth = useSelector(
      (state: RootState) => state.authentication,
      (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );

  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    reset,
    formState: {errors},
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: initialValues,
  })

  // Fetch user profile
  useEffect(() => {
    axios.get(`http://localhost:3002/api/v1/users/${auth.user.id}/profile`)
        .then((res) => reset(res.data))
        .catch((error) => {
          dispatch(alertActions.showAlert({
            variant: "danger",
            message: "Failed to fetch user profile.",
          }));
        });
  }, [auth.user.id, reset, dispatch]);

  const onSubmit = async (data: any) => {
    try {
      // Update profile
      await axios.put(`http://localhost:3002/api/v1/users/${auth.user.id}/profile`, data);
      dispatch(alertActions.showAlert({
        variant: "success",
        message: "Profile updated successfully!",
      }));

      // Update password if provided
      if (data.password) {
        await axios.put(`http://localhost:3002/api/v1/users/${auth.user.id}/password`, {
          password: data.password,
          confirmPassword: data.confirmPassword,
        });
        dispatch(alertActions.showAlert({
          variant: "success",
          message: "Password updated successfully!",
        }));
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.error) {
        dispatch(alertActions.showAlert({
          variant: "danger",
          message: error.response.data.error,
        }));
      }
    }
  };

  return (
      <div className="edit-form-container">
        <h2 className="h2-user-profile">User Profile Information</h2>
        <Form onSubmit={handleSubmit(onSubmit)}>{/* Form Component */}

          {/* Full Name */}
          <div className="form-field">
            <label htmlFor="fullName" style={{ fontWeight: 800 }}>Full name (last, first[middle]):</label>
            <Form.Control type="text" {...register("fullName")} />
            <p className="error-message">{errors.fullName?.message}</p>
          </div>

          {/* Passwords */}
          <div className="form-field">
            <label htmlFor="password">Password:</label>
            <Form.Control type="password" {...register("password")} />
          </div>

          <div className="form-field">
            <label htmlFor="confirmPassword">Confirm your password:</label>
            <Form.Control type="password" {...register("confirmPassword")} />
            <p className="error-message">{errors.confirmPassword?.message}</p>
          </div>

          {/* Note regarding password field */}
          <div className='italics'>
            <p>If password field is blank, the password will not be updated</p>
          </div>

          {/* Email field */}
          <div className="form-field">
            <label htmlFor="email" style={{ fontWeight: 800 }}>E-mail address:</label>
            <Form.Control type="email" {...register("email")} />
            <p className="error-message">{errors.email?.message}</p>
          </div>

          {/* Institution field */}
          <div className="form-field">
            <label htmlFor="institution" style={{ fontWeight: 800 }}>Institution:</label>
            <Form.Select {...register("institution")}>
              <option value="Other">Other</option>
              <option value="North Carolina State University">North Carolina State University</option>
              <option value="Duke University">Duke University</option>
              <option value="Purdue University">Purdue University</option>
              <option value="UT Austin">UT Austin</option>
            </Form.Select>
          </div>

          {/* Action Preference radio buttons */}
          <div className="form-field action-preference custom-column-flex">
            <label style={{ fontWeight: 800 }}>Action Preference:</label>
            <div className="radio-group">
              <label style={{ marginRight: 8 }}>
                <Form.Check
                    type="radio"
                    value="canShowActions"
                    label="Homepage can show actions"
                    {...register("actionPreference")}
                />
              </label>
              <label>
                <Form.Check
                    type="radio"
                    value="cannotShowActions"
                    label="Homepage cannot show actions"
                    {...register("actionPreference")}
                />
              </label>
            </div>
            <p className="error-message">{errors.actionPreference?.message}</p>
          </div>

          <hr /> {/* Horizontal rule for visual separation */}

          {/* Handle field with instructions */}
          <div className="custom-column-flex">
            <label style={{ fontWeight: 800 }}>Handle</label>
            <div>
              A "handle" can be used to conceal your username from people who view your wiki pages. If you have a handle, your wiki account should be named after your handle instead of after your user-ID. If you do not have a handle, your Expertiza user-ID will be used instead. A blank entry in the field below will cause the handle to be set back to your Expertiza user-ID. <div style={{ marginTop: -12 }}><br /></div>
              Note: By using this form, you are changing your default handle, which will be used for all future assignments. To change your handle for a specific assignment, select that assignment and choose the Change Handle action.
            </div>
          </div>

          {/* Handle input field */}
          <div className="form-field" style={{ marginTop: 28 }}>
            <label htmlFor="handle">Default Handle:</label>
            <Form.Control type="text" {...register("handle")} />
            <p className="error-message">{errors.handle?.message}</p>
          </div>

          {/* Email Options checkboxes */}
          <div className="email-options-container">
            <div className="email-options-header">
              <label className="email-options-heading">Email Options:</label>
              <p className="email-instructions">Check the boxes representing the times when you want to receive e-mail.</p>
            </div>
            <div className="checkbox-group">
              <label>
                <Form.Check type="checkbox" label="When someone else reviews my work" {...register("emailOptions.reviewNotification")} />
              </label>
              <label>
                <Form.Check type="checkbox" label="When someone else submits work I am assigned to review" {...register("emailOptions.submissionNotification")} />
              </label>
              <label>
                <Form.Check type="checkbox" label="When someone else reviews one of my reviews (meta-reviews my work)" {...register("emailOptions.metaReviewNotification")} />
              </label>
            </div>
          </div>

          {/* Preferred Time Zone field */}
          <div className="form-field">
            <label htmlFor="timeZone">Preferred Time Zone:</label>
            <Form.Select {...register("timeZone")}>
              <option value="GMT-05:00">GMT-05:00 Eastern Time (US)</option>
              <option value="GMT+01:00">GMT+01:00 Berlin</option>
              <option value="GMT-07:00">GMT-07:00 Arizona (US)</option>
            </Form.Select>
          </div>

          {/* Preferred Language field */}
          <div className="form-field">
            <label htmlFor="language">Preferred Language:</label>
            <Form.Select {...register("language")}>
              <option value="No Preference">No Preference</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
            </Form.Select>
          </div>

          {/* Submit button */}
          <div className="form-field">
            <Button type="submit" variant="outline-success">
              Save
            </Button>
          </div>
        </Form>
      </div>
  );
};

export default Edit;
