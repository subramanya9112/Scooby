# Major_Project_Report_Frontpage_SIT


### Usage and Editing Approach
This Tex project contains three documents
1. FrontPage.tex
2. Title.tex
3. Certificate.tex

The first file **Frontpage.tex** is the master tex file linking the other two. So to build this tex project you have to build/compile **Frontpage.tex**. Editing the other two files for adding details releveant to your project is shown below.

#### 1. Edit Title Page

1. **Open `Title.tex` file. This contains the title page (a.k.a front page) of your report.**

2. **Search for the following snippet:**
```tex
\vfill
\Huge{\textbf{\textcolor{therablue}{Employee Emotion Detection}}}\\
\Large{\textbf{Keeping Your Employees Happy}}
\vfill
```
* Replace the string **Employee Emotion Detection** with the title of your project.
* Replace the string **Keeping Your Employees Happy** with the subtitle of your project.
> NOTE: If your project has no subtitle, you can remove or comment `\Large{\textbf{Keeping Your Employees Happy}}` line from the above snippet.
3. **Search for the following snippet:**
```tex
\begin{tabular}{ccc}
\textbf{Student-1 }&  & \textbf{1SI12CS001}\\
\textbf{Student-2 }&  & \textbf{1SI12CS002}\\
\textbf{Student-3 }&  & \textbf{1SI12CS003}\\
\textbf{Student-4 }&  & \textbf{1SI12CS004}\\
\end{tabular}
\vfill
```
* Replace the strings `Student-1, Student - 2, ... , Student -4`  with your respective team member names.

* Replace the strings `1SI12CS001, 1SI12CS002, ..., 1SI12CS001` with your respective team member USNs.

4. **Search for the following snippet:**
```tex
\Large{\textbf{Prof. ABC}}\\
```
* Replace Prof. ABC with your respective guide's name (with salutation).

5. **Search for the following snippet:**
```tex
\Large{\textbf{Prof. ABC}}\\
Assistant Professor\\
\vfill
```
* Replace **Assistant Professor** with the appropriate designation of your guide.

Congratulations. Your title page of the project is ready.

#### 2. Edit Certificate
1. **Open `Certificate.tex` file. This contains the certificate of your report.**

2. **Search for the following snippet:**
```tex
\textbf{"My Wonderful Project"}
```
* Replace the string **My Wonderful Project** with the title of your project.

3. **Search for the following snippet:**
```tex
\textbf{Student-1(1SI16CS001)}, 
\textbf{Student-2(1SI16CS002)}, 
\textbf{Student-3(1SI16CS003)} 
and 
\textbf{Student-4(1SI16CS004)}
```
* Replace the strings **Student-N{1SI16CS001}** with appropriate substitutes.
> NOTE: If you have less than 4 students in your group, consider deleting one or more \textbf{Student-N(1SI16CS00N)}.
> Don't forget to add *,* (comma) and *and* words appropriately.

4. **Search for the following snippet:**
```tex
\begin{tabular}{cccccccccc}
.................................&&&&&&&&& .................................\\
\textbf{{\footnotesize Guide}} &&&&&&&&&\textbf{{\footnotesize Group Convener}}\\
\textbf{Prof. Prabodh C P}&&&&&&&&& \textbf{Dr. Shreenath K N} \\
\textbf{{\footnotesize Asst. Professor}} &&&&&&&&& \textbf{{\footnotesize Professor}}\\
\textbf{{\footnotesize Dept of CSE, SIT}} &&&&&&&&& \textbf{{\footnotesize Dept of CSE, SIT}}\\
\\
\\
.................................&&&&&&&&& .................................\\
\textbf{Dr. R. Sumathi} &&&&&&&&&  \textbf{Dr. Shivananda K P} \\ 
\textbf{{\footnotesize Professor and Head}} &&&&&&&&&  \textbf{{\footnotesize Principal}} \\
\textbf{{\footnotesize Dept of CSE, SIT}} &&&&&&&&&  \textbf{{\footnotesize SIT, Tumakuru}}\\

\end{tabular} 
```
* Replace strings **Prof. Prabodh C P** and **Dr. Shreenath K N** with your respective guide and convener.
* Replace strings **Asst. Professor** and **Professor** with the designation of your guide and convener respectively.
* Leave everything else as is.

Congratulations. Your certificate page of the project is ready.