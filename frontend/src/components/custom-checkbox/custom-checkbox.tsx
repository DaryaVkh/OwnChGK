import React, {FC} from 'react';
import classes from './custom-checkbox.module.scss';
import {Checkbox} from "@mui/material";
import CheckBoxOutlinedIcon from "@mui/icons-material/CheckBoxOutlined";
import {CustomCheckboxProps} from "../../entities/custom-checkbox/custom-checkbox.interfaces";

const CustomCheckbox: FC<CustomCheckboxProps> = props => {
    return (
        <div className={classes.CustomCheckbox}>
            <div className={classes.labelWrapper}>
                {props.name}
            </div>

            <Checkbox
                sx={{
                    color: "#3282B8",
                    fontSize: "1vw",
                    '&.Mui-checked': {
                        color: "#3282B8",
                    },
                    '&.MuiCheckbox-root': {
                        padding: "0.7vh"
                    },
                    '& .MuiSvgIcon-root': {
                        fontSize: "1.5vw"
                    }
                }}
                checkedIcon={<CheckBoxOutlinedIcon />}
                defaultChecked={props.checked} />
        </div>
    );
}

export default CustomCheckbox;