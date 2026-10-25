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
  FaCloudUploadAlt,
  FaImage,
  FaCompactDisc,
  FaUser,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

import myBackground from "../images/mybackground4.jpg";

import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";

import {
  musicAPI,
  mediaAPI,
} from "../services/api";


// ============================================================
// 🎵 EMPTY MUSIC FORM
// ============================================================

const emptyTrack = {
  title: "",
  artist: "J-Town Hoops",
  description: "",
  category: "J-Town Music",
  externalLink: "",
  album: "",
  isPublished: true,

  audioFile: null,
  coverFile: null,
};


// ============================================================
// 🎵 MUSIC COMPONENT
// ============================================================

export default function Music() {

  // ==========================================================
  // AUTH + NOTIFICATIONS
  // ==========================================================

  const {
    isAdmin,
    user,
  } = useAuth();

  const {
    addSiteUpdate,
  } = useNotifications();


  // ==========================================================
  // STATE
  // ==========================================================

  const [
    customTracks,
    setCustomTracks,
  ] = useState([]);

  const [
    openMenu,
    setOpenMenu,
  ] = useState(null);

  const [
    editingId,
    setEditingId,
  ] = useState(null);

  const [
    editingTrack,
    setEditingTrack,
  ] = useState(null);

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    loadError,
    setLoadError,
  ] = useState("");

  const [
    uploadStatus,
    setUploadStatus,
  ] = useState("");

  const [
    newTrack,
    setNewTrack,
  ] = useState({
    ...emptyTrack,
  });


  // ==========================================================
  // LOAD MUSIC FROM MONGODB
  // ==========================================================

  const loadTracks = async () => {
    try {

      setIsLoading(true);
      setLoadError("");

      const response =
        await musicAPI.getAll();

      // Support several common controller response formats:
      //
      // { music: [] }
      // { tracks: [] }
      // { data: [] }
      // []

      const tracks =
        Array.isArray(response)
          ? response
          : Array.isArray(response?.music)
          ? response.music
          : Array.isArray(response?.tracks)
          ? response.tracks
          : Array.isArray(response?.data)
          ? response.data
          : [];

      setCustomTracks(
        tracks
      );

    } catch (error) {

      console.error(
        "Could not load music:",
        error
      );

      setLoadError(
        error?.message ||
          "The music library could not be loaded."
      );

    } finally {

      setIsLoading(false);

    }
  };


  // ==========================================================
  // LOAD ON PAGE OPEN
  // ==========================================================

  useEffect(() => {

    loadTracks();

  }, []);


  // ==========================================================
  // CLOSE THREE-DOT MENU WHEN CLICKING OUTSIDE
  // ==========================================================

  useEffect(() => {

    const closeMenu = () => {
      setOpenMenu(null);
    };

    window.addEventListener(
      "click",
      closeMenu
    );

    return () => {
      window.removeEventListener(
        "click",
        closeMenu
      );
    };

  }, []);


  // ==========================================================
  // RESET FORM
  // ==========================================================

  const resetForm = () => {

    setNewTrack({
      ...emptyTrack,
    });

    setEditingId(null);

    setEditingTrack(null);

    setUploadStatus("");

  };


  // ==========================================================
  // SEND NOTIFICATION
  // ==========================================================

  const sendMusicNotification = ({
    title,
    description,
  }) => {

    if (
      typeof addSiteUpdate !==
      "function"
    ) {
      return;
    }

    addSiteUpdate({
      title,

      desc: description,

      category: "music",

      origin: "music",

      type: "music",

      link: "/music",

      showInNews: false,

      showInNotifications: true,
    });

  };


  // ==========================================================
  // UPLOAD AUDIO
  // ==========================================================

  const uploadAudioFile =
    async (file) => {

      if (!file) {
        return null;
      }

      setUploadStatus(
        "Uploading audio to J-Town media storage..."
      );

      const response =
        await mediaAPI.uploadAudio({
          file,
          folder: "music",
        });

      if (
        !response?.media?.url
      ) {
        throw new Error(
          "The audio upload completed but no audio URL was returned."
        );
      }

      return response.media;
    };


  // ==========================================================
  // UPLOAD COVER
  // ==========================================================

  const uploadCoverFile =
    async (file) => {

      if (!file) {
        return null;
      }

      setUploadStatus(
        "Uploading cover image..."
      );

      const response =
        await mediaAPI.uploadImage({
          file,
          folder: "music",
        });

      if (
        !response?.media?.url
      ) {
        throw new Error(
          "The cover image upload completed but no image URL was returned."
        );
      }

      return response.media;
    };


  // ==========================================================
  // SAVE TRACK
  // ==========================================================

  const handleAddTrack =
    async (event) => {

      event.preventDefault();


      // -------------------------------------------------------
      // ADMIN CHECK
      // -------------------------------------------------------

      if (!isAdmin) {

        alert(
          "Only administrators can manage music."
        );

        return;
      }


      // -------------------------------------------------------
      // TITLE
      // -------------------------------------------------------

      if (
        !newTrack.title.trim()
      ) {

        alert(
          "Please enter the name of the song."
        );

        return;
      }


      // -------------------------------------------------------
      // NEW TRACK NEEDS AUDIO OR EXTERNAL LINK
      // -------------------------------------------------------

      if (
        editingId === null &&
        !(newTrack.audioFile instanceof File) &&
        !newTrack.externalLink.trim()
      ) {

        alert(
          "Please select an audio file or provide an external music link."
        );

        return;
      }


      setIsSaving(true);

      setUploadStatus(
        "Preparing track..."
      );


      try {

        // =====================================================
        // EXISTING MEDIA
        // =====================================================

        let audioUrl =
          editingTrack?.audioUrl ||
          "";

        let audioPublicId =
          editingTrack?.audioPublicId ||
          "";

        let coverUrl =
          editingTrack?.coverUrl ||
          "";

        let coverPublicId =
          editingTrack?.coverPublicId ||
          "";

        let duration =
          editingTrack?.duration ??
          null;

        let format =
          editingTrack?.format ||
          "";

        let bytes =
          editingTrack?.bytes ||
          0;


        // =====================================================
        // NEW AUDIO
        // =====================================================

        if (
          newTrack.audioFile instanceof
          File
        ) {

          const audioMedia =
            await uploadAudioFile(
              newTrack.audioFile
            );

          audioUrl =
            audioMedia.url ||
            "";

          audioPublicId =
            audioMedia.publicId ||
            "";

          duration =
            typeof audioMedia.duration ===
            "number"
              ? audioMedia.duration
              : null;

          format =
            audioMedia.format ||
            "";

          bytes =
            Number(
              audioMedia.bytes
            ) || 0;
        }


        // =====================================================
        // NEW COVER IMAGE
        // =====================================================

        if (
          newTrack.coverFile instanceof
          File
        ) {

          const coverMedia =
            await uploadCoverFile(
              newTrack.coverFile
            );

          coverUrl =
            coverMedia.url ||
            "";

          coverPublicId =
            coverMedia.publicId ||
            "";
        }


        // =====================================================
        // MONGODB PAYLOAD
        // =====================================================

        const payload = {

          title:
            newTrack.title.trim(),

          artist:
            newTrack.artist.trim() ||
            "J-Town Hoops",

          description:
            newTrack.description.trim(),

          category:
            newTrack.category.trim() ||
            "J-Town Music",

          audioUrl,

          audioPublicId,

          coverUrl,

          coverPublicId,

          externalLink:
            newTrack.externalLink.trim(),

          album:
            newTrack.album.trim(),

          duration,

          format,

          bytes,

          isPublished:
            Boolean(
              newTrack.isPublished
            ),
        };


        // =====================================================
        // UPDATE
        // =====================================================

        if (editingId !== null) {

          setUploadStatus(
            "Updating track in J-Town Hoops..."
          );

          await musicAPI.update(
            editingId,
            payload
          );

          sendMusicNotification({
            title:
              "Music Updated",

            description:
              `${payload.title} was updated in the J-Town Hoops Music Hub.`,
          });

        } else {

          // ===================================================
          // CREATE
          // ===================================================

          setUploadStatus(
            "Saving track to J-Town Hoops..."
          );

          await musicAPI.create(
            payload
          );

          sendMusicNotification({
            title:
              "New Music Added",

            description:
              `${payload.title} was added to the J-Town Hoops Music Hub.`,
          });
        }


        // =====================================================
        // RELOAD FROM SERVER
        // =====================================================

        setUploadStatus(
          "Refreshing music library..."
        );

        await loadTracks();


        // =====================================================
        // FINISH
        // =====================================================

        const wasEditing =
          editingId !== null;

        resetForm();

        setOpenMenu(null);

        alert(
          wasEditing
            ? "Song updated successfully!"
            : "Song uploaded successfully!"
        );


      } catch (error) {

        console.error(
          "Could not save music:",
          error
        );

        alert(
          error?.message ||
            "The song could not be saved. Please try again."
        );

      } finally {

        setIsSaving(false);

        setUploadStatus("");

      }
    };


  // ==========================================================
  // DELETE TRACK
  // ==========================================================

  const handleDeleteTrack =
    async (track) => {

      if (!isAdmin) {
        return;
      }

      const confirmed =
        window.confirm(
          `Are you sure you want to delete "${track.title}"?`
        );

      if (!confirmed) {
        return;
      }


      try {

        await musicAPI.remove(
          track.id
        );

        setCustomTracks(
          (tracks) =>
            tracks.filter(
              (item) =>
                item.id !==
                track.id
            )
        );

        sendMusicNotification({
          title:
            "Music Removed",

          description:
            `${track.title || "A song"} was removed from the J-Town Hoops Music Hub.`,
        });

        setOpenMenu(null);

        if (
          editingId === track.id
        ) {
          resetForm();
        }

        alert(
          "Song deleted successfully."
        );

      } catch (error) {

        console.error(
          "Could not delete track:",
          error
        );

        alert(
          error?.message ||
            "The song could not be deleted."
        );

      }
    };


  // ==========================================================
  // EDIT TRACK
  // ==========================================================

  const handleEditTrack =
    (track) => {

      if (!track) {
        return;
      }

      setNewTrack({

        title:
          track.title || "",

        artist:
          track.artist ||
          "J-Town Hoops",

        description:
          track.description || "",

        category:
          track.category ||
          "J-Town Music",

        externalLink:
          track.externalLink || "",

        album:
          track.album || "",

        isPublished:
          track.isPublished !== false,

        audioFile: null,

        coverFile: null,
      });

      setEditingId(
        track.id
      );

      setEditingTrack(
        track
      );

      setOpenMenu(null);


      setTimeout(() => {

        document
          .getElementById(
            "music-admin-form"
          )
          ?.scrollIntoView({
            behavior: "smooth",

            block: "start",
          });

      }, 100);
    };


  // ==========================================================
  // FORMAT FILE SIZE
  // ==========================================================

  const formatBytes = (
    bytes
  ) => {

    const size =
      Number(bytes) || 0;

    if (!size) {
      return "";
    }

    if (
      size <
      1024 * 1024
    ) {
      return `${(
        size / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      size /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  };


  // ==========================================================
  // MUSIC PLATFORMS
  // ==========================================================

  const platforms = [

    {
      title:
        "Audiomack",

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
      title:
        "Apple Music",

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
      title:
        "iTunes",

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
      title:
        "Amazon Music",

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
      title:
        "Tidal",

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
      title:
        "SoundCloud",

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
      title:
        "Naijailoaded",

      description:
        "Discover Nigerian music releases.",

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
      title:
        "TooXclusive",

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
      title:
        "Spotify",

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


  // ==========================================================
  // PAGE
  // ==========================================================

  return (

    <div
      className="
        min-h-screen
        text-gray-100
        py-12
        px-4
        sm:px-6
        relative
      "

      style={{
        backgroundImage:
          `linear-gradient(rgba(0,0,0,.58),rgba(0,0,0,.64)), url(${myBackground})`,

        backgroundSize:
          "cover",

        backgroundPosition:
          "center",

        backgroundAttachment:
          "fixed",
      }}
    >


      {/* =====================================================
          PAGE TITLE
      ===================================================== */}

      <div className="max-w-7xl mx-auto mb-10">

        <div className="
          relative
          overflow-hidden
          rounded-3xl
          border
          border-amber-500/25
          bg-black/75
          backdrop-blur-md
          p-6
          md:p-9
          shadow-2xl
        ">

          <div className="
            absolute
            -top-20
            -right-20
            w-56
            h-56
            rounded-full
            bg-amber-500/10
            blur-3xl
            pointer-events-none
          " />


          <div className="
            relative
            flex
            flex-col
            lg:flex-row
            lg:items-center
            lg:justify-between
            gap-6
          ">

            <div>

              <div className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-amber-500/30
                bg-amber-500/10
                px-4
                py-2
                text-xs
                font-black
                uppercase
                tracking-[0.22em]
                text-amber-400
              ">
                <FaMusic />

                J-Town Hoops Audio
              </div>


              <h1 className="
                mt-4
                text-4xl
                md:text-6xl
                font-extrabold
                text-amber-500
                uppercase
                tracking-widest
              ">
                Music Hub
              </h1>


              <p className="
                mt-3
                max-w-2xl
                text-gray-300
                leading-relaxed
              ">
                Stream J-Town tracks, discover music
                platforms, and keep the arena energy
                going.
              </p>

            </div>


            <div className="
              grid
              grid-cols-2
              gap-3
              min-w-[260px]
            ">

              <div className="
                rounded-2xl
                border
                border-neutral-700
                bg-neutral-950/80
                p-4
                text-center
              ">

                <div className="
                  text-3xl
                  font-black
                  text-amber-400
                ">
                  {customTracks.length}
                </div>

                <div className="
                  mt-1
                  text-[11px]
                  uppercase
                  tracking-widest
                  text-gray-500
                ">
                  J-Town Tracks
                </div>

              </div>


              <div
                className={`
                  rounded-2xl
                  border
                  p-4
                  text-center

                  ${
                    isAdmin
                      ? "border-amber-500/40 bg-amber-500/10"
                      : "border-neutral-700 bg-neutral-950/80"
                  }
                `}
              >

                <div className="
                  text-sm
                  font-black
                  uppercase
                  tracking-wider
                  text-white
                ">
                  {isAdmin
                    ? "Admin"
                    : "Member"}
                </div>

                <div className="
                  mt-2
                  text-[11px]
                  uppercase
                  tracking-widest
                  text-gray-500
                ">
                  Access Mode
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          LOADING
      ===================================================== */}

      {isLoading && (

        <div className="
          max-w-4xl
          mx-auto
          mb-10
          bg-black/70
          border
          border-neutral-800
          rounded-2xl
          p-8
          text-center
        ">

          <FaCompactDisc
            size={40}
            className="
              mx-auto
              text-amber-500
              animate-spin
            "
          />

          <p className="
            mt-4
            text-gray-300
          ">
            Loading J-Town music...
          </p>

        </div>

      )}


      {/* =====================================================
          LOAD ERROR
      ===================================================== */}

      {!isLoading &&
        loadError && (

        <div className="
          max-w-4xl
          mx-auto
          mb-10
          border
          border-red-500/40
          bg-red-500/10
          rounded-2xl
          p-5
        ">

          <p className="
            text-red-300
            font-bold
          ">
            {loadError}
          </p>

          <button
            type="button"
            onClick={loadTracks}
            className="
              mt-3
              bg-red-500
              hover:bg-red-400
              text-white
              font-bold
              px-4
              py-2
              rounded-lg
              cursor-pointer
            "
          >
            Try Again
          </button>

        </div>

      )}


      {/* =====================================================
          TRACKS
      ===================================================== */}

      {!isLoading &&
        customTracks.length >
          0 && (

        <div className="
          max-w-4xl
          mx-auto
          mb-12
        ">

          <h2 className="
            text-2xl
            font-bold
            text-white
            mb-3
          ">
            Discover New Tracks
          </h2>


          <ul className="space-y-6">

            {customTracks.map(
              (track) => (

              <li
                key={track.id}

                className="
                  group
                  bg-black/70
                  p-6
                  rounded-xl
                  border
                  border-neutral-800
                  hover:border-amber-500/40
                  transition-all
                  hover:-translate-y-1
                  hover:shadow-amber-500/20
                "
              >

                {/* TRACK INFORMATION */}

                <div className="
                  flex
                  items-start
                  gap-4
                ">


                  {/* COVER */}

                  {track.coverUrl ? (

                    <img
                      src={
                        track.coverUrl
                      }

                      alt={
                        `${track.title} cover`
                      }

                      className="
                        w-20
                        h-20
                        object-cover
                        rounded-lg
                        border
                        border-neutral-700
                        group-hover:scale-105
                        transition-transform
                        duration-500
                      "
                    />

                  ) : (

                    <div className="
                      w-20
                      h-20
                      shrink-0
                      rounded-lg
                      border
                      border-neutral-700
                      bg-neutral-900
                      flex
                      items-center
                      justify-center
                    ">

                      <FaMusic
                        size={30}
                        className="
                          text-amber-500
                        "
                      />

                    </div>

                  )}


                  {/* TRACK TEXT */}

                  <div className="
                    flex-1
                    min-w-0
                  ">

                    <div className="
                      flex
                      flex-wrap
                      items-start
                      justify-between
                      gap-2
                    ">

                      <div>

                        <p className="
                          text-white
                          text-xl
                          font-bold
                          group-hover:text-amber-400
                          transition-colors
                        ">
                          {track.title}
                        </p>


                        <p className="
                          text-sm
                          text-amber-400
                          mt-1
                          flex
                          items-center
                          gap-2
                        ">

                          <FaUser
                            size={11}
                          />

                          {track.artist ||
                            "J-Town Hoops"}

                        </p>

                      </div>


                      <div className="
                        flex
                        flex-col
                        items-end
                        gap-1
                      ">

                        <span className="
                          text-[10px]
                          uppercase
                          tracking-widest
                          bg-amber-500/10
                          text-amber-400
                          border
                          border-amber-500/20
                          rounded-full
                          px-3
                          py-1
                        ">
                          {track.category ||
                            "J-Town Music"}
                        </span>


                        {track.isPublished !==
                        false ? (

                          <span className="
                            text-[10px]
                            text-green-400
                            flex
                            items-center
                            gap-1
                          ">
                            <FaCheckCircle />

                            Published
                          </span>

                        ) : (

                          <span className="
                            text-[10px]
                            text-gray-500
                            flex
                            items-center
                            gap-1
                          ">
                            <FaTimesCircle />

                            Draft
                          </span>

                        )}

                      </div>

                    </div>


                    {track.album && (

                      <p className="
                        text-gray-500
                        text-xs
                        mt-2
                      ">
                        Album: {track.album}
                      </p>

                    )}


                    {track.description && (

                      <p className="
                        text-gray-400
                        text-sm
                        mt-2
                      ">
                        {track.description}
                      </p>

                    )}


                    {track.externalLink && (

                      <a
                        href={
                          track.externalLink
                        }

                        target="_blank"

                        rel="noopener noreferrer"

                        className="
                          inline-block
                          text-amber-400
                          text-sm
                          hover:underline
                          mt-2
                        "
                      >
                        Listen externally →
                      </a>

                    )}


                    {(track.format ||
                      track.bytes >
                        0) && (

                      <div className="
                        flex
                        flex-wrap
                        gap-2
                        mt-3
                      ">

                        {track.format && (

                          <span className="
                            text-[10px]
                            uppercase
                            bg-neutral-900
                            border
                            border-neutral-800
                            rounded
                            px-2
                            py-1
                            text-gray-400
                          ">
                            {track.format}
                          </span>

                        )}


                        {track.bytes >
                          0 && (

                          <span className="
                            text-[10px]
                            bg-neutral-900
                            border
                            border-neutral-800
                            rounded
                            px-2
                            py-1
                            text-gray-400
                          ">
                            {formatBytes(
                              track.bytes
                            )}
                          </span>

                        )}

                      </div>

                    )}

                  </div>

                </div>


                {/* AUDIO PLAYER */}

                {track.audioUrl && (

                  <div className="
                    mt-4
                    relative
                    flex
                    items-center
                    gap-2
                  ">

                    <div className="
                      flex-1
                      min-w-0
                    ">

                      <audio
                        controls
                        preload="metadata"
                        className="w-full"
                      >
                        <source
                          src={
                            track.audioUrl
                          }
                        />

                        Your browser does not
                        support the audio
                        element.
                      </audio>

                    </div>


                    {/* THREE DOTS */}

                    <div
                      className="relative"

                      onClick={(event) =>
                        event.stopPropagation()
                      }
                    >

                      <button
                        type="button"

                        onClick={() =>
                          setOpenMenu(
                            openMenu ===
                              track.id
                              ? null
                              : track.id
                          )
                        }

                        className="
                          w-10
                          h-10
                          flex
                          items-center
                          justify-center
                          rounded-full
                          bg-neutral-800
                          text-gray-300
                          hover:bg-amber-500
                          hover:text-black
                          transition
                          cursor-pointer
                        "

                        title="Track options"
                      >
                        <FaEllipsisV />
                      </button>


                      {openMenu ===
                        track.id && (

                        <div className="
                          absolute
                          right-0
                          top-12
                          z-50
                          w-48
                          bg-[#141412]
                          border
                          border-neutral-700
                          rounded-lg
                          shadow-2xl
                          overflow-hidden
                        ">


                          {/* DOWNLOAD */}

                          <a
                            href={
                              track.audioUrl
                            }

                            download

                            target="_blank"

                            rel="noopener noreferrer"

                            onClick={() =>
                              setOpenMenu(
                                null
                              )
                            }

                            className="
                              flex
                              items-center
                              gap-3
                              px-4
                              py-3
                              text-sm
                              text-gray-200
                              hover:bg-neutral-800
                              hover:text-amber-400
                              transition
                              cursor-pointer
                            "
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
                                  track
                                )
                              }

                              className="
                                w-full
                                flex
                                items-center
                                gap-3
                                px-4
                                py-3
                                text-sm
                                text-gray-200
                                hover:bg-neutral-800
                                hover:text-blue-400
                                transition
                                cursor-pointer
                              "
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
                                  track
                                )
                              }

                              className="
                                w-full
                                flex
                                items-center
                                gap-3
                                px-4
                                py-3
                                text-sm
                                text-gray-200
                                hover:bg-neutral-800
                                hover:text-red-400
                                transition
                                cursor-pointer
                              "
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


                <div className="
                  mt-3
                  h-2
                  bg-gradient-to-r
                  from-amber-500
                  via-orange-500
                  to-amber-500
                  rounded-full
                  animate-pulse
                " />

              </li>

            ))}

          </ul>

        </div>

      )}


      {/* =====================================================
          EMPTY LIBRARY
      ===================================================== */}

      {!isLoading &&
        !loadError &&
        customTracks.length ===
          0 && (

        <div className="
          max-w-4xl
          mx-auto
          mb-12
          bg-black/70
          border
          border-neutral-800
          rounded-2xl
          p-8
          text-center
        ">

          <FaMusic
            size={45}
            className="
              mx-auto
              text-amber-500
            "
          />

          <h2 className="
            text-xl
            font-black
            mt-4
          ">
            No J-Town Tracks Yet
          </h2>

          <p className="
            text-gray-400
            mt-2
          ">
            {isAdmin
              ? "Use the administrator form below to upload the first track."
              : "J-Town Hoops music will appear here when it is published."}
          </p>

        </div>

      )}


      {/* =====================================================
          PLATFORM DESCRIPTION
      ===================================================== */}

      <p className="
        text-center
        text-gray-400
        mb-12
      ">
        Explore top platforms for streaming
        and discovering music.
      </p>


      {/* =====================================================
          PLATFORM LINKS
      ===================================================== */}

      <div className="
        grid
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-3
        gap-8
        max-w-7xl
        mx-auto
        mb-12
      ">

        {platforms.map(
          (platform) => (

          <a
            key={
              platform.title
            }

            href={
              platform.link
            }

            target="_blank"

            rel="noopener noreferrer"

            className="
              group
              bg-[#141412]
              rounded-xl
              shadow-lg
              border
              border-neutral-800
              hover:border-amber-500/40
              transition-all
              transform
              hover:-translate-y-2
              hover:shadow-amber-500/20
              p-6
              flex
              flex-col
              items-center
              text-center
              cursor-pointer
            "
          >

            <div className="
              mb-4
              group-hover:scale-125
              transition-transform
              duration-500
            ">
              {platform.icon}
            </div>


            <h3 className="
              text-xl
              font-bold
              text-white
              group-hover:text-amber-400
              transition-colors
            ">
              {platform.title}
            </h3>


            <p className="
              text-sm
              text-gray-400
              mt-2
            ">
              {platform.description}
            </p>


            <span className="
              mt-4
              inline-block
              bg-amber-500
              text-black
              font-bold
              uppercase
              tracking-widest
              text-xs
              px-5
              py-2
              rounded-lg
              shadow-md
              group-hover:bg-orange-500
              transition-all
            ">
              Visit →
            </span>

          </a>

        ))}

      </div>


      {/* =====================================================
          ACCOUNT ACCESS STATUS
      ===================================================== */}

      <div className="
        max-w-2xl
        mx-auto
        mb-8
      ">

        <div
          className={`
            rounded-2xl
            border
            p-5
            backdrop-blur-md

            ${
              isAdmin
                ? "border-amber-500/40 bg-amber-500/10"
                : "border-neutral-700 bg-black/70"
            }
          `}
        >

          <div className="
            flex
            items-start
            gap-4
          ">

            <div
              className={`
                w-12
                h-12
                shrink-0
                rounded-xl
                flex
                items-center
                justify-center

                ${
                  isAdmin
                    ? "bg-amber-500 text-black"
                    : "bg-neutral-800 text-gray-300"
                }
              `}
            >
              <FaMusic
                size={22}
              />
            </div>


            <div>

              <p className="
                font-black
                text-white
              ">
                {isAdmin
                  ? "Music Administrator Controls Active"
                  : "Music Hub — Listener Mode"}
              </p>


              <p className="
                text-sm
                text-gray-400
                mt-1
                leading-relaxed
              ">
                {isAdmin
                  ? `${user?.name || "Administrator"}, you can upload, edit and delete J-Town music. Audio and cover files are stored in cloud media storage while track information is saved in the J-Town database.`
                  : "You can stream available J-Town tracks. Upload, edit and delete controls are reserved for signed-in administrators."}
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          ADMIN FORM
      ===================================================== */}

      {isAdmin && (

        <div
          id="music-admin-form"

          className="
            max-w-2xl
            mx-auto
            mb-12
            bg-[#141412]
            p-6
            rounded-2xl
            shadow-lg
            border
            border-neutral-800
          "
        >

          <div className="
            flex
            items-center
            gap-3
            mb-5
          ">

            <div className="
              w-11
              h-11
              rounded-xl
              bg-amber-500
              text-black
              flex
              items-center
              justify-center
            ">
              <FaCloudUploadAlt
                size={22}
              />
            </div>


            <div>

              <h2 className="
                text-xl
                font-bold
                text-white
              ">
                {editingId !==
                null
                  ? "Edit Music"
                  : "Add Music"}
              </h2>

              <p className="
                text-xs
                text-gray-500
              ">
                Cloud media + J-Town database
              </p>

            </div>

          </div>


          <form
            onSubmit={
              handleAddTrack
            }

            className="space-y-4"
          >


            {/* TITLE */}

            <div>

              <label className="
                block
                text-sm
                text-gray-400
                mb-2
              ">
                Track Title *
              </label>

              <input
                type="text"

                placeholder="Track Title"

                value={
                  newTrack.title
                }

                onChange={(event) =>
                  setNewTrack({
                    ...newTrack,

                    title:
                      event.target
                        .value,
                  })
                }

                className="
                  w-full
                  px-4
                  py-3
                  rounded-xl
                  bg-neutral-900
                  border
                  border-neutral-800
                  text-gray-200
                  outline-none
                  focus:border-amber-500
                "
              />

            </div>


            {/* ARTIST + ALBUM */}

            <div className="
              grid
              sm:grid-cols-2
              gap-4
            ">

              <div>

                <label className="
                  block
                  text-sm
                  text-gray-400
                  mb-2
                ">
                  Artist
                </label>

                <input
                  type="text"

                  placeholder="Artist"

                  value={
                    newTrack.artist
                  }

                  onChange={(event) =>
                    setNewTrack({
                      ...newTrack,

                      artist:
                        event.target
                          .value,
                    })
                  }

                  className="
                    w-full
                    px-4
                    py-3
                    rounded-xl
                    bg-neutral-900
                    border
                    border-neutral-800
                    text-gray-200
                    outline-none
                    focus:border-amber-500
                  "
                />

              </div>


              <div>

                <label className="
                  block
                  text-sm
                  text-gray-400
                  mb-2
                ">
                  Album
                </label>

                <input
                  type="text"

                  placeholder="Album (optional)"

                  value={
                    newTrack.album
                  }

                  onChange={(event) =>
                    setNewTrack({
                      ...newTrack,

                      album:
                        event.target
                          .value,
                    })
                  }

                  className="
                    w-full
                    px-4
                    py-3
                    rounded-xl
                    bg-neutral-900
                    border
                    border-neutral-800
                    text-gray-200
                    outline-none
                    focus:border-amber-500
                  "
                />

              </div>

            </div>


            {/* CATEGORY */}

            <div>

              <label className="
                block
                text-sm
                text-gray-400
                mb-2
              ">
                Category
              </label>

              <input
                type="text"

                placeholder="J-Town Music"

                value={
                  newTrack.category
                }

                onChange={(event) =>
                  setNewTrack({
                    ...newTrack,

                    category:
                      event.target
                        .value,
                  })
                }

                className="
                  w-full
                  px-4
                  py-3
                  rounded-xl
                  bg-neutral-900
                  border
                  border-neutral-800
                  text-gray-200
                  outline-none
                  focus:border-amber-500
                "
              />

            </div>


            {/* DESCRIPTION */}

            <div>

              <label className="
                block
                text-sm
                text-gray-400
                mb-2
              ">
                Description
              </label>

              <textarea
                rows="4"

                placeholder="Track Description"

                value={
                  newTrack.description
                }

                onChange={(event) =>
                  setNewTrack({
                    ...newTrack,

                    description:
                      event.target
                        .value,
                  })
                }

                className="
                  w-full
                  px-4
                  py-3
                  rounded-xl
                  bg-neutral-900
                  border
                  border-neutral-800
                  text-gray-200
                  outline-none
                  focus:border-amber-500
                "
              />

            </div>


            {/* EXTERNAL LINK */}

            <div>

              <label className="
                block
                text-sm
                text-gray-400
                mb-2
              ">
                External Music Link
              </label>

              <input
                type="url"

                placeholder="https://..."

                value={
                  newTrack.externalLink
                }

                onChange={(event) =>
                  setNewTrack({
                    ...newTrack,

                    externalLink:
                      event.target
                        .value,
                  })
                }

                className="
                  w-full
                  px-4
                  py-3
                  rounded-xl
                  bg-neutral-900
                  border
                  border-neutral-800
                  text-gray-200
                  outline-none
                  focus:border-amber-500
                "
              />

              <p className="
                text-xs
                text-gray-600
                mt-2
              ">
                Optional when uploading an audio file.
              </p>

            </div>


            {/* AUDIO */}

            <div className="
              bg-neutral-950
              border
              border-neutral-800
              rounded-xl
              p-4
            ">

              <label className="
                flex
                items-center
                gap-2
                text-sm
                text-gray-300
                mb-3
                font-bold
              ">

                <FaMusic
                  className="
                    text-amber-500
                  "
                />

                {editingId !==
                null
                  ? "Replace Audio File (optional)"
                  : "Audio File"}

              </label>


              {editingId !==
                null &&
                editingTrack
                  ?.audioUrl && (

                <div className="
                  mb-3
                  text-xs
                  text-green-400
                  flex
                  items-center
                  gap-2
                ">

                  <FaCheckCircle />

                  Existing audio will be kept unless you choose another file.

                </div>

              )}


              <input
                type="file"

                accept="
                  audio/mpeg,
                  audio/mp3,
                  audio/wav,
                  audio/x-wav,
                  audio/webm,
                  audio/mp4,
                  audio/x-m4a,
                  audio/aac,
                  audio/ogg,
                  .mp3,
                  .wav,
                  .webm,
                  .m4a,
                  .aac,
                  .ogg
                "

                onChange={(event) =>
                  setNewTrack({
                    ...newTrack,

                    audioFile:
                      event.target
                        .files?.[0] ||
                      null,
                  })
                }

                className="
                  w-full
                  text-gray-300
                  cursor-pointer
                "
              />


              {newTrack.audioFile && (

                <p className="
                  text-xs
                  text-amber-400
                  mt-3
                ">
                  Selected:{" "}
                  {
                    newTrack
                      .audioFile.name
                  }
                </p>

              )}

            </div>


            {/* COVER IMAGE */}

            <div className="
              bg-neutral-950
              border
              border-neutral-800
              rounded-xl
              p-4
            ">

              <label className="
                flex
                items-center
                gap-2
                text-sm
                text-gray-300
                mb-3
                font-bold
              ">

                <FaImage
                  className="
                    text-amber-500
                  "
                />

                {editingId !==
                null
                  ? "Replace Cover Image (optional)"
                  : "Cover Image (optional)"}

              </label>


              {editingId !==
                null &&
                editingTrack
                  ?.coverUrl && (

                <div className="
                  flex
                  items-center
                  gap-3
                  mb-3
                ">

                  <img
                    src={
                      editingTrack.coverUrl
                    }

                    alt="Current cover"

                    className="
                      w-14
                      h-14
                      rounded-lg
                      object-cover
                    "
                  />

                  <p className="
                    text-xs
                    text-green-400
                  ">
                    Existing cover will be kept unless you choose another image.
                  </p>

                </div>

              )}


              <input
                type="file"

                accept="
                  image/jpeg,
                  image/png,
                  image/webp
                "

                onChange={(event) =>
                  setNewTrack({
                    ...newTrack,

                    coverFile:
                      event.target
                        .files?.[0] ||
                      null,
                  })
                }

                className="
                  w-full
                  text-gray-300
                  cursor-pointer
                "
              />


              {newTrack.coverFile && (

                <p className="
                  text-xs
                  text-amber-400
                  mt-3
                ">
                  Selected:{" "}
                  {
                    newTrack
                      .coverFile.name
                  }
                </p>

              )}

            </div>


            {/* PUBLISHED */}

            <label className="
              flex
              items-center
              gap-3
              bg-neutral-950
              border
              border-neutral-800
              rounded-xl
              p-4
              cursor-pointer
            ">

              <input
                type="checkbox"

                checked={
                  newTrack.isPublished
                }

                onChange={(event) =>
                  setNewTrack({
                    ...newTrack,

                    isPublished:
                      event.target
                        .checked,
                  })
                }
              />

              <div>

                <p className="
                  text-sm
                  font-bold
                  text-white
                ">
                  Published
                </p>

                <p className="
                  text-xs
                  text-gray-500
                ">
                  Make this track available in the J-Town Music Hub.
                </p>

              </div>

            </label>


            {/* STATUS */}

            {isSaving &&
              uploadStatus && (

              <div className="
                bg-amber-500/10
                border
                border-amber-500/30
                rounded-xl
                p-4
                text-sm
                text-amber-300
                flex
                items-center
                gap-3
              ">

                <FaCloudUploadAlt
                  className="
                    animate-bounce
                  "
                />

                {uploadStatus}

              </div>

            )}


            {/* SAVE */}

            <button
              type="submit"

              disabled={
                isSaving
              }

              className="
                w-full
                bg-amber-500
                text-black
                font-bold
                uppercase
                tracking-widest
                px-4
                py-3
                rounded-xl
                hover:bg-orange-500
                transition-all
                disabled:opacity-50
                disabled:cursor-not-allowed
                cursor-pointer
                flex
                items-center
                justify-center
                gap-2
              "
            >

              <FaCloudUploadAlt />

              {isSaving
                ? "Saving..."
                : editingId !==
                  null
                ? "Update Track"
                : "Upload Track"}

            </button>


            {/* CANCEL */}

            {editingId !==
              null && (

              <button
                type="button"

                disabled={
                  isSaving
                }

                onClick={
                  resetForm
                }

                className="
                  w-full
                  bg-neutral-700
                  text-white
                  font-bold
                  px-4
                  py-3
                  rounded-xl
                  hover:bg-neutral-600
                  transition-all
                  disabled:opacity-50
                  cursor-pointer
                "
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