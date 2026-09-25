import React, { useEffect, useState } from "react";

import {
  FaSpotify,
  FaApple,
  FaAmazon,
  FaSoundcloud,
  FaMusic,
  FaEdit,
  FaTrash,
  FaDownload,
  FaEllipsisV,
} from "react-icons/fa";

import myBackground from "../images/mybackground4.jpg";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";


// ======================================================
// INDEXEDDB SETTINGS
// ======================================================

const DB_NAME = "JTownHoopsMusicDB";
const DB_VERSION = 1;
const STORE_NAME = "tracks";


// ======================================================
// OPEN DATABASE
// ======================================================

const openMusicDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
        });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};


// ======================================================
// GET ALL TRACKS
// ======================================================

const getAllTracksFromDB = async () => {
  const db = await openMusicDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      "readonly"
    );

    const store = transaction.objectStore(STORE_NAME);

    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};


// ======================================================
// SAVE ONE TRACK
// ======================================================

const saveTrackToDB = async (track) => {
  const db = await openMusicDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      "readwrite"
    );

    const store = transaction.objectStore(STORE_NAME);

    const request = store.put(track);

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};


// ======================================================
// DELETE ONE TRACK
// ======================================================

const deleteTrackFromDB = async (id) => {
  const db = await openMusicDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      "readwrite"
    );

    const store = transaction.objectStore(STORE_NAME);

    const request = store.delete(id);

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};


// ======================================================
// CREATE OBJECT URL
// ======================================================

const createTrackUrls = (track) => {
  return {
    ...track,

    audioUrl: track.audio
      ? URL.createObjectURL(track.audio)
      : null,

    imageUrl: track.image
      ? URL.createObjectURL(track.image)
      : null,
  };
};


// ======================================================
// MUSIC COMPONENT
// ======================================================

export default function Music() {

  // ====================================================
  // SHARED AUTH + NOTIFICATIONS
  // ====================================================

  const { isAdmin, user } = useAuth();
  const { addSiteUpdate } = useNotifications();

  // ====================================================
  // STATES
  // ====================================================

  const [customTracks, setCustomTracks] = useState([]);

  const [openMenu, setOpenMenu] = useState(null);

  const [editingId, setEditingId] = useState(null);

  const [isSaving, setIsSaving] = useState(false);

  const [newTrack, setNewTrack] = useState({
    title: "",
    link: "",
    file: null,
    description: "",
    image: null,
  });


  // ====================================================
  // LOAD MUSIC FROM INDEXEDDB
  // ====================================================

  useEffect(() => {

    let loadedTracks = [];

    const loadTracks = async () => {

      try {

        const tracks = await getAllTracksFromDB();

        loadedTracks = tracks.map(createTrackUrls);

        setCustomTracks(loadedTracks);

      } catch (error) {

        console.error(
          "Could not load music:",
          error
        );

        alert(
          "The music library could not be loaded."
        );
      }
    };


    loadTracks();


    // Cleanup object URLs when component unmounts

    return () => {

      loadedTracks.forEach((track) => {

        if (track.audioUrl) {
          URL.revokeObjectURL(track.audioUrl);
        }

        if (track.imageUrl) {
          URL.revokeObjectURL(track.imageUrl);
        }

      });

    };

  }, []);


  // ====================================================
  // RESET FORM
  // ====================================================

  const resetForm = () => {

    setNewTrack({
      title: "",
      link: "",
      file: null,
      description: "",
      image: null,
    });

    setEditingId(null);

  };


  // ====================================================
  // ADD OR UPDATE TRACK
  // ====================================================

  const handleAddTrack = async (e) => {

    e.preventDefault();


    // -----------------------------------------------
    // Validate title
    // -----------------------------------------------

    if (!newTrack.title.trim()) {

      alert(
        "Please enter the name of the song."
      );

      return;
    }


    // -----------------------------------------------
    // Prevent saving two new empty tracks
    // -----------------------------------------------

    if (
      editingId === null &&
      !(newTrack.file instanceof File)
    ) {

      alert(
        "Please select an audio file before uploading the song."
      );

      return;
    }


    setIsSaving(true);

    const wasEditing = editingId !== null;

    try {

      // ---------------------------------------------
      // Find existing track if editing
      // ---------------------------------------------

      let existingTrack = null;

      if (editingId !== null) {

        existingTrack =
          customTracks.find(
            (track) =>
              track.id === editingId
          );

      }


      // ---------------------------------------------
      // Keep existing audio if no new audio selected
      // ---------------------------------------------

      let audioFile =
        existingTrack?.audio || null;


      // ---------------------------------------------
      // Keep existing image if no new image selected
      // ---------------------------------------------

      let imageFile =
        existingTrack?.image || null;


      // ---------------------------------------------
      // Use newly selected audio
      // ---------------------------------------------

      if (newTrack.file instanceof File) {

        audioFile = newTrack.file;

      }


      // ---------------------------------------------
      // Use newly selected image
      // ---------------------------------------------

      if (newTrack.image instanceof File) {

        imageFile = newTrack.image;

      }


      // ---------------------------------------------
      // Create track
      // ---------------------------------------------

      const trackData = {

        id:
          editingId !== null
            ? editingId
            : `${Date.now()}-${Math.random()
                .toString(36)
                .slice(2)}`,

        title: newTrack.title.trim(),

        link: newTrack.link.trim(),

        description:
          newTrack.description.trim(),

        audio: audioFile,

        image: imageFile,

        createdAt:
          existingTrack?.createdAt ||
          new Date().toISOString(),

      };


      // ---------------------------------------------
      // Save to IndexedDB
      // ---------------------------------------------

      await saveTrackToDB(trackData);


      // ---------------------------------------------
      // Reload all tracks
      // ---------------------------------------------

      const updatedTracks =
        await getAllTracksFromDB();


      // ---------------------------------------------
      // Create URLs for displaying files
      // ---------------------------------------------

      const tracksWithUrls =
        updatedTracks.map(
          createTrackUrls
        );


      // ---------------------------------------------
      // Revoke old URLs
      // ---------------------------------------------

      customTracks.forEach((track) => {

        if (track.audioUrl) {
          URL.revokeObjectURL(
            track.audioUrl
          );
        }

        if (track.imageUrl) {
          URL.revokeObjectURL(
            track.imageUrl
          );
        }

      });


      // ---------------------------------------------
      // Update React state
      // ---------------------------------------------

      setCustomTracks(
        tracksWithUrls
      );

      // Send the same update into the shared J-Town notification system.
      if (typeof addSiteUpdate === "function") {
        addSiteUpdate({
          title: wasEditing ? "Music Updated" : "New Music Added",
          desc: wasEditing
            ? `${trackData.title} was updated in the J-Town Hoops Music Hub.`
            : `${trackData.title} was added to the J-Town Hoops Music Hub.`,
          category: "music",
          origin: "music",
          type: "music",
          link: "/music",
          showInNews: false,
          showInNotifications: true,
        });
      }


      // ---------------------------------------------
      // Reset form
      // ---------------------------------------------

      resetForm();


      // ---------------------------------------------
      // Close menu
      // ---------------------------------------------

      setOpenMenu(null);


      // ---------------------------------------------
      // Success message
      // ---------------------------------------------

      alert(
        editingId !== null
          ? "Song updated successfully!"
          : "Song uploaded successfully!"
      );

    } catch (error) {

      console.error(
        "Could not save music:",
        error
      );

      alert(
        "The song could not be saved. Please try again with another audio file."
      );

    } finally {

      setIsSaving(false);

    }

  };


  // ====================================================
  // DELETE TRACK
  // ====================================================

  const handleDeleteTrack = async (id) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this song?"
      );


    if (!confirmed) {
      return;
    }


    try {

      const trackToDelete =
        customTracks.find(
          (track) =>
            track.id === id
        );


      await deleteTrackFromDB(id);


      if (trackToDelete?.audioUrl) {
        URL.revokeObjectURL(
          trackToDelete.audioUrl
        );
      }


      if (trackToDelete?.imageUrl) {
        URL.revokeObjectURL(
          trackToDelete.imageUrl
        );
      }


      setCustomTracks(
        (tracks) =>
          tracks.filter(
            (track) =>
              track.id !== id
          )
      );

      if (typeof addSiteUpdate === "function") {
        addSiteUpdate({
          title: "Music Removed",
          desc: `${trackToDelete?.title || "A song"} was removed from the J-Town Hoops Music Hub.`,
          category: "music",
          origin: "music",
          type: "music",
          link: "/music",
          showInNews: false,
          showInNotifications: true,
        });
      }


      setOpenMenu(null);


      alert(
        "Song deleted successfully."
      );

    } catch (error) {

      console.error(
        "Could not delete track:",
        error
      );

      alert(
        "The song could not be deleted."
      );

    }

  };


  // ====================================================
  // EDIT TRACK
  // ====================================================

  const handleEditTrack = (id) => {

    const track =
      customTracks.find(
        (item) =>
          item.id === id
      );


    if (!track) {
      return;
    }


    setNewTrack({

      title:
        track.title || "",

      link:
        track.link || "",

      description:
        track.description || "",

      // IMPORTANT:
      // We don't put the existing Blob
      // into the file input.
      // The existing file is preserved
      // automatically during update.

      file: null,

      image: null,

    });


    setEditingId(id);


    setOpenMenu(null);


    // Scroll down to the admin form

    setTimeout(() => {

      window.scrollTo({

        top:
          document.body.scrollHeight,

        behavior: "smooth",

      });

    }, 150);

  };


  // ====================================================
  // MUSIC PLATFORMS
  // ====================================================

  const platforms = [

    {
      title: "Audiomack",

      description:
        "Stream trending African and global hits.",

      icon: (
        <FaMusic
          size={50}
          className="text-amber-400"
        />
      ),

      link:
        "https://audiomack.com/",
    },


    {
      title: "Apple Music",

      description:
        "Discover millions of songs and playlists.",

      icon: (
        <FaApple
          size={50}
          className="text-gray-200"
        />
      ),

      link:
        "https://music.apple.com/",
    },


    {
      title: "iTunes",

      description:
        "Buy and download your favorite tracks.",

      icon: (
        <FaApple
          size={50}
          className="text-red-500"
        />
      ),

      link:
        "https://www.apple.com/itunes/",
    },


    {
      title: "Amazon Music",

      description:
        "Stream music with Prime or Unlimited.",

      icon: (
        <FaAmazon
          size={50}
          className="text-yellow-400"
        />
      ),

      link:
        "https://music.amazon.com/",
    },


    {
      title: "Tidal",

      description:
        "High-fidelity sound and exclusive content.",

      icon: (
        <FaMusic
          size={50}
          className="text-blue-500"
        />
      ),

      link:
        "https://tidal.com/",
    },


    {
      title: "SoundCloud",

      description:
        "Discover underground and indie artists.",

      icon: (
        <FaSoundcloud
          size={50}
          className="text-orange-500"
        />
      ),

      link:
        "https://soundcloud.com/",
    },


    {
      title: "Naijailoaded",

      description:
        "Download latest Nigerian songs.",

      icon: (
        <FaMusic
          size={50}
          className="text-green-500"
        />
      ),

      link:
        "https://www.naijailoaded.com.ng/",
    },


    {
      title: "TooXclusive",

      description:
        "Stay updated with Nigerian music releases.",

      icon: (
        <FaMusic
          size={50}
          className="text-purple-500"
        />
      ),

      link:
        "https://tooxclusive.com/",
    },


    {
      title: "Spotify",

      description:
        "Stream millions of songs worldwide.",

      icon: (
        <FaSpotify
          size={50}
          className="text-green-500"
        />
      ),

      link:
        "https://spotify.com/",
    },

  ];


  // ====================================================
  // PAGE
  // ====================================================

  return (

    <div

      className="min-h-screen text-gray-100 py-12 px-6 relative"

      style={{

        backgroundImage:
          ` linear-gradient(rgba(0,0,0,.58),rgba(0,0,0,.64)), url(${myBackground})`,

        backgroundSize:
          "cover",

        backgroundPosition:
          "center",

        backgroundAttachment:
          "fixed",

      }}

    >


      {/* =================================================
          PAGE TITLE
      ================================================= */}

      <div className="max-w-7xl mx-auto mb-10">
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/25 bg-black/75 backdrop-blur-md p-6 md:p-9 shadow-2xl">
          <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-amber-400">
                <FaMusic /> J-Town Hoops Audio
              </div>
              <h1 className="mt-4 text-4xl md:text-6xl font-extrabold text-amber-500 uppercase tracking-widest">
                Music Hub
              </h1>
              <p className="mt-3 max-w-2xl text-gray-300 leading-relaxed">
                Stream J-Town tracks, discover music platforms, and keep the arena energy going.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 min-w-[260px]">
              <div className="rounded-2xl border border-neutral-700 bg-neutral-950/80 p-4 text-center">
                <div className="text-3xl font-black text-amber-400">{customTracks.length}</div>
                <div className="mt-1 text-[11px] uppercase tracking-widest text-gray-500">J-Town Tracks</div>
              </div>
              <div className={`rounded-2xl border p-4 text-center ${isAdmin ? "border-amber-500/40 bg-amber-500/10" : "border-neutral-700 bg-neutral-950/80"}`}>
                <div className="text-sm font-black uppercase tracking-wider text-white">
                  {isAdmin ? "Admin" : "Member"}
                </div>
                <div className="mt-2 text-[11px] uppercase tracking-widest text-gray-500">Access Mode</div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* =================================================
          CUSTOM TRACKS
      ================================================= */}

      {customTracks.length > 0 && (

        <div className="max-w-4xl mx-auto mb-12">


          <h2 className="text-2xl font-bold text-white mb-3">

            Discover New Tracks

          </h2>


          <ul className="space-y-6">


            {customTracks.map(
              (track) => (

              <li

                key={track.id}

                className="group bg-black/70 p-6 rounded-lg border border-neutral-800 hover:border-amber-500/40 transition-all transform hover:-translate-y-2 hover:shadow-amber-500/20"

              >


                {/* =====================================
                    TRACK INFORMATION
                ===================================== */}

                <div className="flex items-center gap-4">


                  {/* COVER IMAGE */}

                  {track.imageUrl && (

                    <img

                      src={track.imageUrl}

                      alt={`${track.title} cover`}

                      className="w-20 h-20 object-cover rounded-lg border border-neutral-700 group-hover:scale-105 transition-transform duration-500"

                    />

                  )}


                  {/* TRACK TEXT */}

                  <div className="flex-1 min-w-0">


                    <p className="text-white text-xl font-bold group-hover:text-amber-400 transition-colors">

                      {track.title}

                    </p>


                    {track.description && (

                      <p className="text-gray-400 text-sm mt-1">

                        {track.description}

                      </p>

                    )}


                    {track.link && (

                      <a

                        href={track.link}

                        target="_blank"

                        rel="noopener noreferrer"

                        className="text-amber-400 text-sm hover:underline"

                      >

                        Listen →

                      </a>

                    )}

                  </div>


                </div>


                {/* =====================================
                    AUDIO PLAYER + THREE DOTS
                ===================================== */}

                {track.audioUrl && (

                  <div className="mt-4 relative flex items-center gap-2">


                    {/* AUDIO PLAYER */}

                    <div className="flex-1 min-w-0">

                      <audio

                        controls

                        className="w-full"

                      >

                        <source
                          src={track.audioUrl}
                        />

                        Your browser does not support the audio element.

                      </audio>

                    </div>


                    {/* =================================
                        THREE DOT BUTTON
                    ================================= */}

                    <div className="relative">


                      <button

                        type="button"

                        onClick={() =>
                          setOpenMenu(
                            openMenu === track.id
                              ? null
                              : track.id
                          )
                        }

                        className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-800 text-gray-300 hover:bg-amber-500 hover:text-black transition"

                        title="Track options"

                      >

                        <FaEllipsisV />

                      </button>


                      {/* =================================
                          DROPDOWN
                      ================================= */}

                      {openMenu === track.id && (

                        <div className="absolute right-0 top-12 z-50 w-48 bg-[#141412] border border-neutral-700 rounded-lg shadow-2xl overflow-hidden">


                          {/* DOWNLOAD */}

                          <a

                            href={track.audioUrl}

                            download={`${track.title || "music-track"}.mp3`}

                            onClick={() =>
                              setOpenMenu(null)
                            }

                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-200 hover:bg-neutral-800 hover:text-amber-400 transition"

                          >

                            <FaDownload />

                            Download

                          </a>


                          {/* EDIT */}

                          {isAdmin && (

                            <button

                              type="button"

                              onClick={() =>
                                handleEditTrack(
                                  track.id
                                )
                              }

                              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-200 hover:bg-neutral-800 hover:text-blue-400 transition"

                            >

                              <FaEdit />

                              Edit

                            </button>

                          )}


                          {/* DELETE */}

                          {isAdmin && (

                            <button

                              type="button"

                              onClick={() =>
                                handleDeleteTrack(
                                  track.id
                                )
                              }

                              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-200 hover:bg-neutral-800 hover:text-red-400 transition"

                            >

                              <FaTrash />

                              Delete

                            </button>

                          )}

                        </div>

                      )}

                    </div>


                  </div>

                )}


                {/* DECORATIVE MUSIC WAVE */}

                <div className="mt-3 h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 rounded-full animate-pulse"></div>


              </li>

            ))}

          </ul>

        </div>

      )}


      {/* =================================================
          DESCRIPTION
      ================================================= */}

      <p className="text-center text-gray-400 mb-12">

        Explore top platforms for streaming and downloading music.

      </p>


      {/* =================================================
          PLATFORM LINKS
      ================================================= */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-12">


        {platforms.map(
          (platform, idx) => (

          <a

            key={idx}

            href={platform.link}

            target="_blank"

            rel="noopener noreferrer"

            className="group bg-[#141412] rounded-xl shadow-lg border border-neutral-800 hover:border-amber-500/40 transition-all transform hover:-translate-y-2 hover:shadow-amber-500/20 p-6 flex flex-col items-center text-center"

          >


            <div className="mb-4 group-hover:scale-125 transition-transform duration-500">

              {platform.icon}

            </div>


            <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">

              {platform.title}

            </h3>


            <p className="text-sm text-gray-400 mt-2">

              {platform.description}

            </p>


            <span className="mt-4 inline-block bg-amber-500 text-black font-bold uppercase tracking-widest text-xs px-5 py-2 rounded-lg shadow-md hover:bg-orange-500 hover:shadow-lg hover:-translate-y-1 transition-all">

              Visit →

            </span>


          </a>

        ))}

      </div>


      {/* =================================================
          ACCOUNT ACCESS STATUS
      ================================================= */}

      <div className="max-w-2xl mx-auto mb-8">
        <div className={`rounded-2xl border p-5 backdrop-blur-md ${
          isAdmin
            ? "border-amber-500/40 bg-amber-500/10"
            : "border-neutral-700 bg-black/70"
        }`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center ${
              isAdmin ? "bg-amber-500 text-black" : "bg-neutral-800 text-gray-300"
            }`}>
              <FaMusic size={22} />
            </div>
            <div>
              <p className="font-black text-white">
                {isAdmin ? "Music Administrator Controls Active" : "Music Hub — Listener Mode"}
              </p>
              <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                {isAdmin
                  ? `${user?.name || "Administrator"}, you can upload, edit and delete J-Town music. Changes are also sent to the shared notification system.`
                  : "You can stream and download available J-Town tracks. Upload, edit and delete controls are reserved for signed-in administrators."}
              </p>
            </div>
          </div>
        </div>
      </div>


      {/* =================================================
          ADMIN FORM
      ================================================= */}

      {isAdmin && (

        <div className="max-w-2xl mx-auto mb-12 bg-[#141412] p-6 rounded-lg shadow-lg border border-neutral-800">


          {/* FORM TITLE */}

          <h2 className="text-xl font-bold text-white mb-4">

            {editingId !== null
              ? "Edit Music"
              : "Add Music"}

          </h2>


          <form
            onSubmit={handleAddTrack}
            className="space-y-4"
          >


            {/* TITLE */}

            <input

              type="text"

              placeholder="Track Title"

              value={newTrack.title}

              onChange={(e) =>
                setNewTrack({
                  ...newTrack,
                  title:
                    e.target.value,
                })
              }

              className="w-full px-4 py-2 rounded bg-neutral-900 text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500"

            />


            {/* DESCRIPTION */}

            <textarea

              placeholder="Track Description"

              value={newTrack.description}

              onChange={(e) =>
                setNewTrack({
                  ...newTrack,
                  description:
                    e.target.value,
                })
              }

              className="w-full px-4 py-2 rounded bg-neutral-900 text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500"

            />


            {/* MUSIC LINK */}

            <input

              type="text"

              placeholder="Music Link (optional)"

              value={newTrack.link}

              onChange={(e) =>
                setNewTrack({
                  ...newTrack,
                  link:
                    e.target.value,
                })
              }

              className="w-full px-4 py-2 rounded bg-neutral-900 text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500"

            />


            {/* AUDIO FILE */}

            <div>

              <label className="block text-sm text-gray-400 mb-2">

                {editingId !== null
                  ? "Replace Audio File (optional)"
                  : "Audio File"}

              </label>


              <input

                type="file"

                accept="audio/*"

                onChange={(e) =>
                  setNewTrack({
                    ...newTrack,
                    file:
                      e.target.files?.[0] ||
                      null,
                  })
                }

                className="w-full text-gray-300"

              />

            </div>


            {/* COVER IMAGE */}

            <div>

              <label className="block text-sm text-gray-400 mb-2">

                {editingId !== null
                  ? "Replace Cover Image (optional)"
                  : "Cover Image (optional)"}

              </label>


              <input

                type="file"

                accept="image/*"

                onChange={(e) =>
                  setNewTrack({
                    ...newTrack,
                    image:
                      e.target.files?.[0] ||
                      null,
                  })
                }

                className="w-full text-gray-300"

              />

            </div>


            {/* SAVE BUTTON */}

            <button

              type="submit"

              disabled={isSaving}

              className="w-full bg-amber-500 text-black font-bold uppercase tracking-widest px-4 py-2 rounded hover:bg-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"

            >

              {isSaving
                ? "Saving..."
                : editingId !== null
                ? "Update Track"
                : "Upload Track"}

            </button>


            {/* CANCEL EDIT */}

            {editingId !== null && (

              <button

                type="button"

                onClick={() => {

                  resetForm();

                }}

                className="w-full bg-neutral-700 text-white font-bold px-4 py-2 rounded hover:bg-neutral-600 transition-all"

              >

                Cancel Edit

              </button>

            )}


          </form>

        </div>

      )}

    </div>

  );

}



