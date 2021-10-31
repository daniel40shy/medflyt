import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import * as dbUtil from './../utils/dbUtil';

interface Report {
    year: number,
    caregivers: {
        name: string,
        patients: string[]
    }[]
}



export const getReport = async (req: Request, res: Response) => {
    var year=req.url.substring(req.url.lastIndexOf('/') + 1);
    const sql = `
        SELECT
        caregiver.id      AS caregiver_id,
        caregiver.name    AS caregiver_name,
        string_agg(patient.name, ', ' ORDER BY patient.name) AS patient_name
        FROM caregiver
        JOIN visit ON visit.caregiver = caregiver.id
        JOIN patient ON patient.id = visit.patient		
        where EXTRACT(YEAR FROM visit.date)=${year}
        Group by caregiver_id ,caregiver_name`; 

        
    let result: QueryResult;
    try {
        result = await dbUtil.sqlToDB(sql, []);
        const report: Report = {
            year: parseInt(req.params.year),
            caregivers: []
        };

        for (let row of result.rows) {
            report.caregivers.push({
                name: row.caregiver_name,
                patients: [row.patient_name]
            })
        }
        res.status(200).json(report);

    } catch (error) {
        throw new Error((error as Error).message);
    }
}
