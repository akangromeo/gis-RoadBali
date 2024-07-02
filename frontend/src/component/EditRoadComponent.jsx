import React, { useState, useEffect } from "react";
import { Button, Label, TextInput, Select } from "flowbite-react";
import AsyncSelect from "react-select/async";

const EditRoadComponent = ({ data, onSubmit, lengthRoad }) => {
  const [formData, setFormData] = useState({
    nama_ruas: "",
    panjang: "",
    lebar: "",
    eksisting_id: "",
    kondisi_id: "",
    jenisjalan_id: "",
    keterangan: "",
    paths: "",
  });

  const [eksistingOptions, setEksistingOptions] = useState([]);
  const [kondisiOptions, setKondisiOptions] = useState([]);
  const [jenisJalanOptions, setJenisJalanOptions] = useState([]);

  useEffect(() => {
    if (data) {
      setFormData({
        nama_ruas: data.nama_ruas || "",
        panjang: data.panjang || "",
        lebar: data.lebar || "",
        eksisting_id: data.eksisting_id || "",
        kondisi_id: data.kondisi_id || "",
        jenisjalan_id: data.jenisjalan_id || "",
        keterangan: data.keterangan || "",
        paths: data.paths || "",
      });
    }
  }, [data]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("https://gisapis.manpits.xyz/api/meksisting", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data.eksisting)) {
          setEksistingOptions(
            data.eksisting.map((eksistingItem) => ({
              value: eksistingItem.id,
              label: eksistingItem.eksisting,
            }))
          );
        } else {
          console.error("Invalid data format for eksisting options");
        }
      })
      .catch((error) =>
        console.error("Error fetching eksisting options:", error)
      );

    fetch("https://gisapis.manpits.xyz/api/mkondisi", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => {
        if (
          data &&
          data.status === "success" &&
          Array.isArray(data.eksisting)
        ) {
          setKondisiOptions(
            data.eksisting.map((kondisiItem) => ({
              value: kondisiItem.id,
              label: kondisiItem.kondisi,
            }))
          );
        } else {
          console.error(
            "Invalid data format for kondisi options or error fetching kondisi options"
          );
        }
      })
      .catch((error) =>
        console.error("Error fetching kondisi options:", error)
      );

    fetch("https://gisapis.manpits.xyz/api/mjenisjalan", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => {
        if (
          data &&
          data.status === "success" &&
          Array.isArray(data.eksisting)
        ) {
          setJenisJalanOptions(
            data.eksisting.map((jenisJalanItem) => ({
              value: jenisJalanItem.id,
              label: jenisJalanItem.jenisjalan,
            }))
          );
        } else {
          console.error(
            "Invalid data format for jenis jalan options or error fetching jenis jalan options"
          );
        }
      })
      .catch((error) =>
        console.error("Error fetching jenis jalan options:", error)
      );
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting road data:", error);
    }
  };

  return (
    <div className="w-full mx-auto">
      <div className="text-center font-bold mb-8">
        <h2 className="text-2xl">Edit Road</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          <div className="mb-5">
            <Label htmlFor="nama_ruas" value="Road Name :" />
            <TextInput
              id="nama_ruas"
              name="nama_ruas"
              value={formData.nama_ruas}
              onChange={handleChange}
              placeholder="Nama Ruas"
              required
            />
          </div>

          <div className="mb-5">
            <Label htmlFor="panjang" value="Length (Km)" />
            <TextInput
              id="panjang"
              name="panjang"
              type="number"
              value={formData.panjang}
              onChange={handleChange}
              placeholder="Panjang"
              required
            />
          </div>

          <div className="mb-5">
            <Label htmlFor="lebar" value="Wide (M)" />
            <TextInput
              id="lebar"
              name="lebar"
              type="number"
              value={formData.lebar}
              onChange={handleChange}
              placeholder="Lebar"
              required
            />
          </div>

          <div className="mb-5">
            <Label htmlFor="eksisting_id" value="Road Material :" />
            <Select
              id="eksisting_id"
              name="eksisting_id"
              value={formData.eksisting_id}
              onChange={(e) =>
                setFormData({ ...formData, eksisting_id: e.target.value })
              }
              required
            >
              <option value="">Choose Material</option>
              {eksistingOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="mb-5">
            <Label htmlFor="kondisi_id" value="Condition :" />
            <Select
              id="kondisi_id"
              name="kondisi_id"
              value={formData.kondisi_id}
              onChange={(e) =>
                setFormData({ ...formData, kondisi_id: e.target.value })
              }
              required
            >
              <option value="">Choose Condition</option>
              {kondisiOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="mb-5">
            <Label htmlFor="jenisjalan_id" value="Road Type :" />
            <Select
              id="jenisjalan_id"
              name="jenisjalan_id"
              value={formData.jenisjalan_id}
              onChange={(e) =>
                setFormData({ ...formData, jenisjalan_id: e.target.value })
              }
              required
            >
              <option value="">Choose Road Type</option>
              {jenisJalanOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="mb-5">
            <Label htmlFor="keterangan" value="Information :" />
            <TextInput
              id="keterangan"
              name="keterangan"
              value={formData.keterangan}
              onChange={handleChange}
              placeholder="example : Frequently used"
              required
            />
          </div>
        </div>
        <div className="w-full mt-5">
          <Button
            type="submit"
            className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Update Road
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditRoadComponent;
