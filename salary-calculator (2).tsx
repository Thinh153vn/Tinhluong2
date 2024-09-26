import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const SalaryCalculator = () => {
  const [workDays, setWorkDays] = useState([]);
  const [totalSalary, setTotalSalary] = useState(0);
  const [alert, setAlert] = useState(null);

  // Tỉ giá chuyển đổi từ VND sang JPY (giả định)
  const VND_TO_JPY = 0.0056;

  useEffect(() => {
    const savedData = localStorage.getItem('salaryData');
    if (savedData) {
      setWorkDays(JSON.parse(savedData));
    }
  }, []);

  const addWorkDay = () => {
    setWorkDays([...workDays, { date: '', startTime: '', endTime: '' }]);
  };

  const updateWorkDay = (index, field, value) => {
    const updatedDays = [...workDays];
    updatedDays[index][field] = value;
    setWorkDays(updatedDays);
    saveData(updatedDays);
  };

  const getSalaryType = (date) => {
    const dayOfWeek = new Date(date).getDay();
    return dayOfWeek === 0 || dayOfWeek === 6 ? 'B' : 'A';
  };

  const calculateSalary = () => {
    let total = 0;
    workDays.forEach(day => {
      if (!day.date || !day.startTime || !day.endTime) return;

      const start = new Date(`${day.date}T${day.startTime}:00`);
      const end = new Date(`${day.date}T${day.endTime}:00`);
      let hours = (end - start) / 3600000;
      
      const salaryType = getSalaryType(day.date);
      let dailySalary = 0;
      if (salaryType === 'A') {
        dailySalary = Math.min(hours, 8) * 1198;
      } else {
        dailySalary = Math.min(hours, 8) * 1248;
      }
      
      if (hours > 8) {
        dailySalary += (hours - 8) * 1497.5;
      }
      
      total += dailySalary + 356; // Thêm tiền di chuyển
    });
    setTotalSalary(total * VND_TO_JPY); // Chuyển đổi sang JPY
  };

  const saveData = (data) => {
    localStorage.setItem('salaryData', JSON.stringify(data));
    setAlert({ type: 'success', message: 'Dữ liệu đã được lưu thành công!' });
    setTimeout(() => setAlert(null), 3000);
  };

  const exportToCSV = () => {
    const headers = ['Ngày', 'Giờ bắt đầu', 'Giờ kết thúc', 'Loại lương'];
    const csvContent = [
      headers.join(','),
      ...workDays.map(day => [day.date, day.startTime, day.endTime, getSalaryType(day.date)].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'salary_data.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setAlert({ type: 'success', message: 'Dữ liệu đã được xuất thành công!' });
    setTimeout(() => setAlert(null), 3000);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Tính lương tháng (JPY)</CardTitle>
      </CardHeader>
      <CardContent>
        {alert && (
          <Alert className="mb-4">
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ngày làm việc</TableHead>
              <TableHead>Giờ bắt đầu</TableHead>
              <TableHead>Giờ kết thúc</TableHead>
              <TableHead>Loại lương</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workDays.map((day, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Input
                    type="date"
                    value={day.date}
                    onChange={(e) => updateWorkDay(index, 'date', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="time"
                    value={day.startTime}
                    onChange={(e) => updateWorkDay(index, 'startTime', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="time"
                    value={day.endTime}
                    onChange={(e) => updateWorkDay(index, 'endTime', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  {day.date ? getSalaryType(day.date) : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex space-x-2 mt-4">
          <Button onClick={addWorkDay}>Thêm ngày làm việc</Button>
          <Button onClick={calculateSalary}>Tính lương</Button>
          <Button onClick={() => saveData(workDays)}>Lưu dữ liệu</Button>
          <Button onClick={exportToCSV}>Xuất CSV</Button>
        </div>
        {totalSalary > 0 && (
          <div className="mt-4">
            <strong>Tổng lương: {totalSalary.toFixed(2)} JPY</strong>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SalaryCalculator;
