import React, { useState, useEffect } from "react";
import { Button, Label, TextInput, Select } from "flowbite-react";
import AsyncSelect from "react-select/async";

const RoadModalComponent = ({ formData, onClose }) => {
  const [localFormData, setLocalFormData] = useState({
    desa_id: "",
    kode_ruas: "",
    nama_ruas: "",
    panjang: formData.panjang,
    lebar: "",
    eksisting_id: "",
    kondisi_id: "",
    jenisjalan_id: "",
    keterangan: "",
    paths: formData.paths || "",
  });

  const [desaOptions, setDesaOptions] = useState([]);
  const [eksistingOptions, setEksistingOptions] = useState([]);
  const [kondisiOptions, setKondisiOptions] = useState([]);
  const [jenisJalanOptions, setJenisJalanOptions] = useState([]);

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subDistricts, setSubDistricts] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState({
    id: "",
    name: "",
  });
  const [selectedDistrict, setSelectedDistrict] = useState({
    id: "",
    name: "",
  });
  const [selectedSubDistrict, setSelectedSubDistrict] = useState({
    id: "",
    name: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("https://gisapis.manpits.xyz/api/provinsi/1", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => response.json())
        .then((data) => {
          setProvinces(
            data.provinsi.map((province) => ({
              id: province.id,
              name: province.value,
            }))
          );
        })
        .catch((error) => console.error("Error fetching provinces:", error));
    }
  }, []);

  useEffect(() => {
    if (selectedProvince.id) {
      const token = localStorage.getItem("token");
      fetch(
        `https://gisapis.manpits.xyz/api/kabupaten/${selectedProvince.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
        .then((response) => response.json())
        .then((data) => {
          setDistricts(
            data.kabupaten.map((district) => ({
              id: district.id,
              name: district.value,
            }))
          );
        })
        .catch((error) => console.error("Error fetching districts:", error));
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedDistrict.id) {
      const token = localStorage.getItem("token");
      fetch(
        `https://gisapis.manpits.xyz/api/kecamatan/${selectedDistrict.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
        .then((response) => response.json())
        .then((data) => {
          setSubDistricts(
            data.kecamatan.map((subDistrict) => ({
              id: subDistrict.id,
              name: subDistrict.value,
            }))
          );
        })
        .catch((error) =>
          console.error("Error fetching sub-districts:", error)
        );
    }
  }, [selectedDistrict]);

  useEffect(() => {
    if (selectedSubDistrict.id) {
      const token = localStorage.getItem("token");
      fetch(`https://gisapis.manpits.xyz/api/desa/${selectedSubDistrict.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => response.json())
        .then((data) => {
          if (Array.isArray(data.desa)) {
            setDesaOptions(
              data.desa.map((desa) => ({
                value: desa.id,
                label: desa.value,
              }))
            );
          } else {
            console.error("Invalid data format for desa options");
          }
        })
        .catch((error) => console.error("Error fetching desa options:", error));
    }
  }, [selectedSubDistrict]);

  useEffect(() => {
    console.log("Start Form data: ", localFormData);
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
    setLocalFormData({
      ...localFormData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    const token = localStorage.getItem("token");

    e.preventDefault();
    try {
      const response = await fetch(
        "https://gisapis.manpits.xyz/api/ruasjalan",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(localFormData),
        }
      );
      const data = await response.json();
      console.log(data);
      window.location.reload();
    } catch (error) {
      console.error("Error:", error);
      // Handle error
    }
  };

  return (
    <div className="modal-content">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Form Data Polyline
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-3 gap-4">
          {/* Provinsi */}
          <div className="mb-4">
            <Label htmlFor="province" value="Province" />
            <Select
              id="province"
              value={selectedProvince.id}
              onChange={(e) => {
                setSelectedProvince({
                  id: e.target.value,
                  name: e.target.options[e.target.selectedIndex].text,
                });
              }}
            >
              <option value="">Choose Province</option>
              {provinces.map((province) => (
                <option key={province.id} value={province.id}>
                  {province.name}
                </option>
              ))}
            </Select>
          </div>
          {/* Kabupaten */}
          <div className="mb-4">
            <Label htmlFor="district" value="District" />
            <Select
              id="district"
              value={selectedDistrict.id}
              onChange={(e) => {
                setSelectedDistrict({
                  id: e.target.value,
                  name: e.target.options[e.target.selectedIndex].text,
                });
              }}
            >
              <option value="">Choose District</option>
              {districts.map((district) => (
                <option key={district.id} value={district.id}>
                  {district.name}
                </option>
              ))}
            </Select>
          </div>
          {/* Kecamatan */}
          <div className="mb-4">
            <Label htmlFor="sub-district" value="Subdistrict" />
            <Select
              id="sub-district"
              value={selectedSubDistrict.id}
              onChange={(e) => {
                setSelectedSubDistrict({
                  id: e.target.value,
                  name: e.target.options[e.target.selectedIndex].text,
                });
              }}
            >
              <option value="">Choose Subdistrict</option>
              {subDistricts.map((subDistrict) => (
                <option key={subDistrict.id} value={subDistrict.id}>
                  {subDistrict.name}
                </option>
              ))}
            </Select>
          </div>
          {/* Desa */}
          <div className="mb-4">
            <Label htmlFor="desa_id" value="Village" />
            <AsyncSelect
              cacheOptions
              loadOptions={(inputValue, callback) => {
                const filteredOptions = desaOptions.filter((option) =>
                  option.label.toLowerCase().includes(inputValue.toLowerCase())
                );
                callback(filteredOptions);
              }}
              defaultOptions={desaOptions}
              onChange={(selectedOption) => {
                setLocalFormData({
                  ...localFormData,
                  desa_id: selectedOption ? selectedOption.value : "",
                });
              }}
              value={desaOptions.find(
                (option) => option.value === localFormData.desa_id
              )}
              placeholder="Choose Village"
            />
          </div>
          {/* Kode Ruas */}
          <div className="mb-4">
            <Label htmlFor="kode_ruas" value="Road Code" />
            <TextInput
              id="kode_ruas"
              name="kode_ruas"
              value={localFormData.kode_ruas}
              onChange={handleChange}
              placeholder="Example : 1"
            />
          </div>
          {/* Nama Ruas */}
          <div className="mb-4">
            <Label htmlFor="nama_ruas" value="Road Name" />
            <TextInput
              id="nama_ruas"
              name="nama_ruas"
              value={localFormData.nama_ruas}
              onChange={handleChange}
              placeholder="example : Jalan Raya x"
            />
          </div>
          {/* Panjang */}
          <div className="mb-4">
            <Label htmlFor="panjang" value="Length" />
            <TextInput
              id="panjang"
              name="panjang"
              value={localFormData.panjang}
              onChange={handleChange}
              placeholder="Auto"
            />
          </div>
          {/* Lebar */}
          <div className="mb-4">
            <Label htmlFor="lebar" value="Wide" />
            <TextInput
              id="lebar"
              name="lebar"
              value={localFormData.lebar}
              onChange={handleChange}
              placeholder="example : 2"
            />
          </div>
          {/* Eksisting ID */}
          <div className="mb-4">
            <Label htmlFor="eksisting_id" value="Road Material" />
            <Select
              id="eksisting_id"
              value={localFormData.eksisting_id}
              onChange={(e) => {
                setLocalFormData({
                  ...localFormData,
                  eksisting_id: e.target.value,
                });
              }}
            >
              <option value="">Choose Road Material</option>
              {eksistingOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          {/* Kondisi ID */}
          <div className="mb-4">
            <Label htmlFor="kondisi_id" value="Condition" />
            <Select
              id="kondisi_id"
              value={localFormData.kondisi_id}
              onChange={(e) => {
                setLocalFormData({
                  ...localFormData,
                  kondisi_id: e.target.value,
                });
              }}
            >
              <option value="">Choose Condition</option>
              {kondisiOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          {/* Jenis Jalan ID */}
          <div className="mb-4">
            <Label htmlFor="jenisjalan_id" value="Road Type" />
            <Select
              id="jenisjalan_id"
              value={localFormData.jenisjalan_id}
              onChange={(e) => {
                setLocalFormData({
                  ...localFormData,
                  jenisjalan_id: e.target.value,
                });
              }}
            >
              <option value="">Choose Road Type</option>
              {jenisJalanOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          {/* Keterangan */}
          <div className="col-span-2 mb-4">
            <Label htmlFor="keterangan" value="Information" />
            <TextInput
              id="keterangan"
              name="keterangan"
              value={localFormData.keterangan}
              onChange={handleChange}
              placeholder="Example : Frequently Used"
            />
          </div>
          <input type="hidden" name="paths" value={localFormData.paths} />
        </div>
        <div className="flex justify-center">
          <Button
            type="submit"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Save
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RoadModalComponent;
