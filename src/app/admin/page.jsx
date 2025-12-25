"use client";
import { useState } from "react";
import { db, storage } from "@/lib/firebase";
import { ref as dbRef, runTransaction, set } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import "@/styles/admin.css";

export default function AdminPage() {
    const [form, setForm] = useState({
        title: "",
        released: "",
        director: "",
        language: "",
        genre: "",
    });

    const [multiplier, setMultiplier] = useState(10000000);
    const [dailyData, setDailyData] = useState(Array(30).fill(""));
    const [imageFile, setImageFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Handlers
    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleGridChange = (index, value) => {
        const newGrid = [...dailyData];
        newGrid[index] = value;
        setDailyData(newGrid);
    };

    // Live Total Calculation
    const currentTotal = dailyData.reduce((acc, curr) => acc + (Number(curr) || 0), 0) * multiplier;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!imageFile) return alert("Please upload a poster!");
        setUploading(true);

        try {
            const tempFileName = `${Date.now()}_${imageFile.name}`;
            const fileRef = storageRef(storage, `posters/${tempFileName}`);
            const uploadResult = await uploadBytes(fileRef, imageFile);
            const posterUrl = await getDownloadURL(uploadResult.ref);

            const counterRef = dbRef(db, "metadata/movie_counter");
            const result = await runTransaction(counterRef, (val) => (val || 0) + 1);

            if (result.committed) {
                const idNum = result.snapshot.val();
                const newId = `tgr_${idNum.toString().padStart(3, "0")}`;

                const finalLedger = {};
                dailyData.forEach((val, i) => {
                    if (val !== "" && val !== 0) finalLedger[`day${i + 1}`] = Number(val) * Number(multiplier);
                });

                await set(dbRef(db, `catalog/movies/${newId}`), { ...form, poster: posterUrl });
                await set(dbRef(db, `ledger/daily_collections/${newId}`), finalLedger);

                alert(`Success! Saved as ${newId}`);
                window.location.reload(); // Simplest way to reset all states
            }
        } catch (err) {
            console.error(err);
            alert("Submission failed. Check console.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="admin-wrapper">
            <form onSubmit={handleSubmit} className="admin-card">
                <h2>Add Movie & Collections</h2>
                <div className="details-grid">

                    <div className="poster-upload-container">
                        <label className="poster-label">
                            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} hidden />
                            {imageFile ? (
                                <div className="preview-box">
                                    <img src={URL.createObjectURL(imageFile)} alt="preview" />
                                    <p>Change Poster</p>
                                </div>
                            ) : (
                                <div className="upload-placeholder"><p>Upload Poster</p></div>
                            )}
                        </label>
                    </div>

                    <div className="form-section">
                        {["title", "director", "language", "genre"].map((field) => (
                            <div className="input-group" key={field}>
                                <label>{field}</label>
                                <input name={field} type="text" value={form[field]} onChange={handleChange} required={field === 'title'} />
                            </div>
                        ))}
                        <div className="input-group">
                            <label>Release Date</label>
                            <input name="released" type="date" value={form.released} onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <label>Multiplier</label>
                            <input type="number" value={multiplier} onChange={e => setMultiplier(e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className="github-grid-container">
                    <div className="grid-header">
                        <label>Daily Grid (Day 1 - 30)</label>
                        <span className="live-total">Total: ₹{currentTotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="grid-layout">
                        {dailyData.map((val, i) => (
                            <div key={i} className="grid-item">
                                <span className="day-label">{i + 1}</span>
                                <input type="number" value={val} placeholder="" onChange={(e) => handleGridChange(i, e.target.value)} />
                            </div>
                        ))}
                    </div>
                </div>

                <button type="submit" className="submit-btn" disabled={uploading}>
                    {uploading ? "Publishing..." : "Publish to Database"}
                </button>
            </form>
        </div>
    );
}